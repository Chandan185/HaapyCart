const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logout,
  forgetPassword,
  resetPassword,
  getuserProfile,
  changePassword,
  updateUserProfile,
  allusers,
  getUserDetails,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/profile").get(isAuthenticatedUser, getuserProfile);
router.route("/password/change").put(isAuthenticatedUser, changePassword);
router.route("/password/forgot").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/profile/update").post(isAuthenticatedUser, updateUserProfile);
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allusers);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getUserDetails)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUser)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);
router.route("/logout").get(logout);
module.exports = router;
