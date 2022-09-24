const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  requestABook,
  markRequestedBookAsFound,
  deleteRequestedBook,
  getAllRequestedBooks,
  reportABook,
} = require("../controllers/bookRequestedController");

router.get("/", auth, getAllRequestedBooks);
router.post("/", auth, requestABook);
router.post("/markFound/:id", auth, markRequestedBookAsFound);
router.post("/report/:id", auth, reportABook);
router.delete("/:id", auth, deleteRequestedBook);

module.exports = router;
