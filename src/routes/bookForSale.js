const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  markBookAsSold,
  deleteBookOnSale,
  getOneBookOnSale,
  getAllBooksOnSale,
  updateBookForSale,
  sellABook,
  reportABook,
} = require("../controllers/bookForSaleController");

router.get("/:id", auth, getOneBookOnSale);
router.get("/", auth, getAllBooksOnSale);
router.post("/", auth, sellABook);
router.post("/markSold/:id", auth, markBookAsSold);
router.post("/report/:id", auth, reportABook);
router.patch("/:id", auth, updateBookForSale);
router.delete("/:id", auth, deleteBookOnSale);

module.exports = router;
