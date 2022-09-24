const BookForSale = require("../models/bookForSale");
const BookRequested = require("../models/bookRequested");
const User = require("../models/user");

const getAllBooksOnSale = async (req, res) => {
  try {
    const books = await BookForSale.find({
      active: true,
      deleted: false,
    })
      .sort({ createdAt: -1 })
      .select("-reports");
    res.send(books);
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const getAllReportedBooksOnSale = async (req, res) => {
  try {
    const books = await BookForSale.find({
      active: true,
      deleted: false,
    })
      .populate({
        path: "seller",
        select: "name avatar ",
      })
      .populate({
        path: "reports.reporter",
        select: "name avatar ",
      });
    const reportedBooks = [];
    books.forEach((book) => {
      if (book.reports.length > 0) {
        book.reports.forEach((report) => {
          reportedBooks.push({
            reportId: report._id,
            book: book.book,
            _id: book._id,
            seller: book.seller,
            reporter: report.reporter,
            date: report.date,
          });
        });
      }
    });
    res.send(reportedBooks.sort((a, b) => b.date - a.date));
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const getAllReportedBooksRequested = async (req, res) => {
  try {
    const books = await BookRequested.find({
      active: true,
      deleted: false,
    })
      .populate({
        path: "user",
        select: "name avatar ",
      })
      .populate({
        path: "reports.reporter",
        select: "name avatar ",
      });
    const reportedBooks = [];
    books.forEach((book) => {
      if (book.reports.length > 0) {
        book.reports.forEach((report) => {
          reportedBooks.push({
            reportId: report._id,
            book: book.book,
            seller: book.user,
            _id: book._id,
            reporter: report.reporter,
            date: report.date,
          });
        });
      }
    });
    res.send(reportedBooks.sort((a, b) => b.date - a.date));
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const getAllReportedUsers = async (req, res) => {
  try {
    const users = await User.find().populate({
      path: "reports.reporter",
      select: "name avatar ",
    });
    const reportedUsers = [];
    users.forEach((user) => {
      if (user.reports.length > 0) {
        user.reports.forEach((report) => {
          reportedUsers.push({
            reportId: report._id,
            name: user.name,
            avatar: user.avater,
            email: user.email,
            _id: user._id,
            reporter: report.reporter,
            date: report.date,
          });
        });
      }
    });
    res.send(reportedUsers.sort((a, b) => b.date - a.date));
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const getAllBooksRequested = async (req, res) => {
  try {
    const books = await BookRequested.find({
      active: true,
      deleted: false,
    })
      .populate({
        path: "user",
        select: "name avatar email contact_number",
      })
      .sort({ createdAt: -1 })
      .select("-reports");
    res.send(books);
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false });
    res.send(users);
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const deleteBookRequested = async (req, res) => {
  try {
    const book = await BookRequested.findById(req.params.id);
    book.deleted = true;
    book.active = false;
    await book.save();
    res.send();
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const deleteBookOnSale = async (req, res) => {
  try {
    const book = await BookForSale.findById(req.params.id);
    book.deleted = true;
    book.active = false;
    await book.save();
    res.send();
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const deleteUserReport = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.reports = user.reports.filter(
      (report) => report._id.toString() !== req.params.reportId.toString()
    );
    await user.save();
    res.send();
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const deleteBookRequestReport = async (req, res) => {
  try {
    const book = await BookRequested.findById(req.params.id);
    book.reports = book.reports.filter(
      (report) => report._id.toString() !== req.params.reportId.toString()
    );
    await book.save();
    res.send();
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

const deleteBookSaleReport = async (req, res) => {
  try {
    const book = await BookForSale.findById(req.params.id);
    book.reports = book.reports.filter(
      (report) => report._id.toString() !== req.params.reportId.toString()
    );
    await book.save();
    res.send();
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};

module.exports = {
  getAllBooksOnSale,
  getAllBooksRequested,
  deleteBookRequested,
  deleteBookOnSale,
  getAllReportedBooksOnSale,
  getAllReportedBooksRequested,
  getAllReportedUsers,
  getAllUsers,
  deleteBookSaleReport,
  deleteBookRequestReport,
  deleteUserReport,
};
