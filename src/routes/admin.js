const router = require("express").Router();
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const {
  getAllBooksOnSale,
  getAllUsers,
  getAllBooksRequested,
  deleteBookOnSale,
  deleteBookRequested,
  getAllReportedBooksOnSale,
  getAllReportedBooksRequested,
  getAllReportedUsers,
  deleteBookRequestReport,
  deleteBookSaleReport,
  deleteUserReport,
} = require("../controllers/adminController");

router.get("/users/reports", auth, admin, getAllReportedUsers);
router.get("/users", auth, admin, getAllUsers);
router.get("/sales/reports", auth, admin, getAllReportedBooksOnSale);
router.get("/sales", auth, admin, getAllBooksOnSale);
router.get("/requests/reports", auth, admin, getAllReportedBooksRequested);
router.get("/requests", auth, admin, getAllBooksRequested);

router.delete("/users/reports/:id/:reportId", auth, admin, deleteUserReport);
router.delete(
  "/sales/reports/:id/:reportId",
  auth,
  admin,
  deleteBookSaleReport
);
router.delete("/sales/:id", auth, admin, deleteBookOnSale);
router.delete(
  "/requests/reports/:id/:reportId",
  auth,
  admin,
  deleteBookRequestReport
);
router.delete("/requests/:id", auth, admin, deleteBookRequested);

module.exports = router;
