const BookRequested = require("../models/bookRequested");

const requestABook = async (req, res) => {
  try {
    const { isbn, title, edition, authors, course_name, course_code } =
      req.body;
    let bookRequested;
    if (req.body.id) {
      bookRequested = await BookRequested.findOne({
        _id: req.body.id,
        user: req.user,
      });
      bookRequested.book = {
        ...bookRequested.book,
        isbn,
        title,
        edition,
        authors,
      };
      bookRequested.course_code = course_code;
      bookRequested.course_name = course_name;
    } else {
      const book = await BookRequested.findOne({
        "book.isbn": isbn,
        active: true,
        seller: req.user,
      });
      if (book) {
        return res.status(403).send({
          errMessage: "You have already requested this book!",
        });
      }
      bookRequested = new BookRequested({
        book: {
          isbn,
          title,
          edition,
          authors: authors.includes(",") ? authors.split(",") : [authors],
        },
        course_name,
        course_code,
        user: req.user,
      });
    }

    await bookRequested.save();
    res.send(bookRequested);
  } catch (error) {
    res.status(500).send({
      errMessage: error.message,
    });
  }
};

const getAllRequestedBooks = async (req, res) => {
  try {
    const booksRequested = await BookRequested.find({
      active: true,
      deleted: false,
      user: { $ne: req.user._id },
    })
      .populate({
        path: "user",
        select: "name avatar email contact_number",
      })
      .sort({ createdAt: -1 })
      .select("-reports");
    res.send(booksRequested);
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const markRequestedBookAsFound = async (req, res) => {
  try {
    const bookRequested = await BookRequested.findOne({
      _id: req.params.id,
      active: true,
      deleted: false,
      seller: req.user,
    });
    if (!bookRequested) {
      return res.status(404).send({
        error: "No such book found",
      });
    }
    bookRequested.active = false;
    await bookRequested.save();
    res.send();
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const deleteRequestedBook = async (req, res) => {
  try {
    const bookRequested = await BookRequested.findOne({
      _id: req.params.id,
      seller: req.user,
    });
    if (!bookRequested) {
      return res.status(404).send({
        error: "No such book found",
      });
    }

    bookRequested.active = false;
    bookRequested.deleted = true;
    await bookRequested.save();
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
    const reportedBook = await BookRequested.findById(req.params.id);
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
  requestABook,
  getAllRequestedBooks,
  markRequestedBookAsFound,
  deleteRequestedBook,
  reportABook,
};
