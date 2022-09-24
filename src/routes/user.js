const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  loginUser,
  signupUser,
  getLoggedInUserInfo,
  logoutUser,
  logoutUserEverywhere,
  updateUser,
  changeAvatar,
  deleteAvatar,
  getUserBookmarks,
  getBooksUserSold,
  getBooksUserRequested,
  getUserInfo,
  bookmarkABook,
  deleteBookmark,
  reportAUser,
} = require("../controllers/userController");

router.get("/me/bookmarks", auth, getUserBookmarks);
router.get("/me/sale", auth, getBooksUserSold);
router.get("/me/requests", auth, getBooksUserRequested);
router.get("/me", auth, getLoggedInUserInfo);
router.get("/:id", auth, getUserInfo);
router.post("/bookmark/:id", auth, bookmarkABook);
router.post("/report/:id", auth, reportAUser);
router.post("/login", loginUser);
router.post("/", signupUser);
router.post("/me/avatar", auth, changeAvatar);
router.post("/logout", auth, logoutUser);
router.post("/logoutAll", auth, logoutUserEverywhere);
router.patch("/me", auth, updateUser);
router.delete("/me/avatar", auth, deleteAvatar);
router.delete("/bookmark/:id", auth, deleteBookmark);

module.exports = router;
