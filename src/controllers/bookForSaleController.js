const BookForSale = require("../models/bookForSale");
const fileUpload = require("../services/multer");
const upload = fileUpload();
const deleteFileFromS3 = require("../services/deleteFile");

const multiUpload = upload.array("files", 2);
const sellABook = async (req, res) => {
  try {
    multiUpload(req, res, async function (err) {
      if (err) {
        if (err.message && err.message === "File too large") {
          err.errMessage = "File size cannot be larger than 2 MB";
        }
        return res.status(403).send(err);
      }

      if (req.files) {
        const {
          isbn,
          title,
          edition,
          authors,
          amount,
          condition,
          course_name,
          course_code,
        } = req.body;

        const book = await BookForSale.findOne({
          "book.isbn": isbn,
          active: true,
          seller: req.user,
        });

        if (book) {
          for (let i = 0; i < req.files.length; i++) {
            deleteFileFromS3(req.files[i].location);
          }
          return res.status(403).send({
            errMessage: "You are already selling this book!",
          });
        }

        const bookForSale = new BookForSale({
          book: {
            isbn,
            title,
            edition,
            authors: authors.includes(",") ? authors.split(",") : [authors],
          },
          amount: parseFloat(amount),
          condition,
          course_name,
          course_code,
          seller: req.user,
        });

        for (let i = 0; i < req.files.length; i++) {
          bookForSale.pictures.push(req.files[i].location);
        }
        await bookForSale.save();
        res.send(bookForSale);
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

//How do I handle multiple user trying to update book with same isbn
const updateBookForSale = async (req, res) => {
  try {
    multiUpload(req, res, async function (err) {
      if (err) {
        console.log(err);
        if (err.message && err.message === "File too large") {
          err.errMessage = "File size cannot be larger than 2 MB";
        }
        return res.status(403).send(err);
      }

      if (req.files) {
        const {
          isbn,
          title,
          edition,
          authors,
          amount,
          condition,
          course_name,
          course_code,
          pictures,
          deletedPictures,
        } = req.body;

        const book = await BookForSale.findOne({
          _id: req.params.id,
          seller: req.user,
        });
        book.book = {
          ...book.book,
          isbn,
          title,
          edition,
          authors: authors.includes(",") ? authors.split(",") : [authors],
        };
        book.amount = amount;
        book.condition = condition;
        book.course_name = course_name;
        book.course_code = course_code;
        book.pictures = JSON.parse(pictures);
        for (let i = 0; i < req.files.length; i++) {
          book.pictures.push(req.files[i].location);
        }
        let deletedImages = JSON.parse(deletedPictures);
        for (let i = 0; i < deletedImages.length; i++) {
          deleteFileFromS3(deletedImages[i]);
        }

        await book.save();
        res.send(book);
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

const markBookAsSold = async (req, res) => {
  try {
    const bookForSale = await BookForSale.findOne({
      _id: req.params.id,
      active: true,
      deleted: false,
      seller: req.user,
    });
    if (!bookForSale) {
      return res.status(404).send({
        error: "No such book found",
      });
    }

    bookForSale.active = false;
    await bookForSale.save();
    res.send();
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const getAllBooksOnSale = async (req, res) => {
  try {
    const booksOnSale = await BookForSale.find({
      active: true,
      seller: { $ne: req.user._id },
      deleted: false,
    })
      .sort({ createdAt: -1 })
      .select("-reports");
    res.send(booksOnSale);
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const getOneBookOnSale = async (req, res) => {
  try {
    const bookForSale = await BookForSale.findOne({
      _id: req.params.id,
      active: true,
      deleted: false,
    })
      .populate({
        path: "seller",
        select: "name email contact_number bookmarks isAdmin",
      })
      .select("-reports");

    if (!bookForSale) {
      return res.status(404).send({
        error: "No such book found",
      });
    }
    res.send(bookForSale);
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};
const deleteBookOnSale = async (req, res) => {
  try {
    const bookForSale = await BookForSale.findOne({
      _id: req.params.id,
      seller: req.user,
      deleted: false,
    });

    if (!bookForSale) {
      return res.status(404).send({
        error: "No such book found",
      });
    }
    for (let i = 0; i < bookForSale.pictures.length; i++) {
      deleteFileFromS3(bookForSale.pictures[i]);
    }
    bookForSale.active = false;
    bookForSale.deleted = true;
    await bookForSale.save();
    res.send();
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const reportABook = async (req, res) => {
  try {
    const reporter = req.user;
    const reportedBook = await BookForSale.findById(req.params.id);
    if (
      reportedBook.reports.length > 0 &&
      reportedBook.reports.filter(
        (report) => report.reporter.toString() === reporter._id.toString()
      )
    ) {
      return res.status(404).send({
        error: "You have already reported this book",
      });
    }
    reportedBook.reports.unshift({
      reporter,
    });
    await reportedBook.save();
    res.send();
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

module.exports = {
  sellABook,
  updateBookForSale,
  markBookAsSold,
  getAllBooksOnSale,
  getOneBookOnSale,
  deleteBookOnSale,
  reportABook,
};
