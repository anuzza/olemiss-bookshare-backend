const User = require("../models/user");
const fileUpload = require("../services/multer");
const upload = fileUpload();
const deleteFileFromS3 = require("../services/deleteFile");

// ----Auth handlers start----
const signupUser = async (req, res) => {
  req.body.avatar = "";
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    let validationErrors = {};
    if (error.errors || error.code === 11000) {
      if (error.errors) {
        if (error.errors.name) {
          validationErrors.nameError = "Name is required";
        }
        if (error.errors.email) {
          switch (error.errors.email.kind) {
            case "user defined":
              validationErrors.emailError =
                error.errors.email.properties.message;
              break;
            default:
              validationErrors.emailError = "Email is required";
          }
        }
        if (error.errors.password) {
          switch (error.errors.password.kind) {
            case "minlength":
              validationErrors.passwordError =
                "Password must be 6 characters long";
              break;
            case "required":
              validationErrors.passwordError = "Password is required";
              break;
            default:
              validationErrors.passwordError =
                "Cannot contain the word password";
          }
        }
        if (error.errors.major) {
          validationErrors.majorError = "Major is required";
        }
        if (error.errors.classification) {
          validationErrors.classificationError = "Classification is required";
        }
      } else {
        validationErrors.error = "User already exists";
      }
      return res.status(400).send(validationErrors);
    }
    return res.status(500).send({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  let validationErrors = {};
  if (req.body.email === "" || req.body.password === "") {
    if (req.body.email === "") {
      validationErrors.emailError = "Email is Required";
    }
    if (req.body.password === "") {
      validationErrors.passwordError = "Password is Required";
    }
    return res.status(400).send(validationErrors);
  }
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (error) {
    if (error.message?.includes("timed out")) {
      return res.status(400).send({ error: "Network error" });
    }
    if (error.toString().includes("Error: ")) {
      return res.status(400).send({
        error: error.toString().split("Error: ")[1],
      });
    }

    return res.status(500).send({ error: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { tokens: req.user.tokens.filter((token) => token.token !== req.token) }
    );
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).send(error);
  }
};

const logoutUserEverywhere = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { tokens: [] });
    res.sendStatus(200);
  } catch (error) {
    return res.status(400).send(error);
  }
};

const getLoggedInUserInfo = async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: "booksForSale",
        select: "-reports",
      })
      .populate({
        path: "booksRequested",
        select: "-reports",
      });

    const sellingBooks = user.booksForSale.filter(
      ({ active }) => active === true
    );
    const profile = {
      id: user._id,
      isAdmin: user.isAdmin,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      major: user.major,
      classification: user.classification,
      selling: sellingBooks.length,
      sold: user.booksForSale.length - sellingBooks.length,
      requested: user.booksRequested.length,
      booksForSale: sellingBooks.slice(0, 3),
    };
    res.send(profile);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

//Question:Do I allow changing password in a seperate route or in this same route?
const updateUser = async (req, res) => {
  const updates = Object.keys(req.body);
  let validationErrors = {};
  const allowedUpdates = [
    "name",
    "email",
    "contact_number",
    "classification",
    "major",
  ];
  const isValidOperators = updates.every((item) => {
    return allowedUpdates.includes(item);
  });
  if (!isValidOperators) {
    validationErrors.error = "Invalid operations!";
    return res.status(400).send(validationErrors);
  }

  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();

    res.send(req.user);
  } catch (error) {
    if (error.errors || error.code === 11000) {
      if (error.errors) {
        if (error.errors.name) {
          validationErrors.nameError = "Name is required";
        }
        if (error.errors.email) {
          switch (error.errors.email.kind) {
            case "user defined":
              validationErrors.emailError =
                error.errors.email.properties.message;
              break;
            default:
              validationErrors.emailError = "Email is required";
          }
        }

        if (error.errors.major) {
          validationErrors.majorError = "Major is required";
        }
        if (error.errors.classification) {
          validationErrors.classificationError = "Classification is required";
        }
      } else {
        validationErrors.error = "User already exists";
      }
      return res.status(400).send(validationErrors);
    }
    return res.status(500).send({ error: error.message });
  }
};

const bookmarkABook = async (req, res) => {
  try {
    req.user.bookmarks.unshift(req.params.id);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const deleteBookmark = async (req, res) => {
  try {
    req.user.bookmarks = req.user.bookmarks.filter(
      (bookmark) => bookmark.toString() !== req.params.id.toString()
    );
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getUserBookmarks = async (req, res) => {
  try {
    const { bookmarks } = await User.findById(req.user._id).populate({
      path: "bookmarks",
      match: { deleted: false },
    });
    res.send(bookmarks);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

//Use virtual field to build these apis
const getBooksUserSold = async (req, res) => {
  try {
    const { booksForSale } = await User.findById(req.user).populate({
      path: "booksForSale",
      match: { deleted: false },
      select: "-reports",
    });
    res.send(booksForSale);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
const getBooksUserRequested = async (req, res) => {
  try {
    const { booksRequested } = await User.findById(req.user).populate({
      path: "booksRequested",
      match: { deleted: false },
      select: "-reports",
    });
    res.send(booksRequested);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

//Todo: Upload Image to AWS S3 and save the url to image avatar
const singleUpload = upload.single("avatar");
const changeAvatar = async (req, res) => {
  try {
    singleUpload(req, res, async function (err) {
      if (err) {
        if (err.message && err.message === "File too large") {
          err.errMessage = "File size cannot be larger than 2 MB";
        }
        return res.status(403).send(err);
      }
      if (req.file) {
        let update = { avatar: req.file.location };
        let prevAvatar = req.user.avatar;

        await User.findByIdAndUpdate(req.user._id, update);
        if (prevAvatar && prevAvatar !== "") {
          deleteFileFromS3(prevAvatar);
        }
        res.sendStatus(200);
      } else {
        return res.status(404).send({
          errMessage: "No file found!",
        });
      }
    });
  } catch (error) {
    res.status(400).send({
      errMessage: err.message,
    });
  }
};

const deleteAvatar = async (req, res) => {
  try {
    const prevAvatar = req.user.avatar;
    if (prevAvatar && prevAvatar !== "") {
      deleteFileFromS3(prevAvatar);
    }

    req.user.avatar = "";
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(400).send(err);
  }
};

const reportAUser = async (req, res) => {
  try {
    const reporter = req.user;
    const reportedUser = await User.findById(req.params.id);
    if (
      reportedUser.reports.length > 0 &&
      reportedUser.reports.filter(
        (report) => report.reporter.toString() === reporter._id.toString()
      )
    ) {
      return res.status(404).send({
        error: "You have already reported this user",
      });
    }
    reportedUser.reports.unshift({
      reporter,
    });
    await reportedUser.save();
    res.send();
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getLoggedInUserInfo,
  logoutUser,
  logoutUserEverywhere,
  updateUser,
  getUserInfo,
  changeAvatar,
  deleteAvatar,

  getUserBookmarks,
  getBooksUserSold,
  getBooksUserRequested,
  bookmarkABook,
  deleteBookmark,
  reportAUser,
};
