const express = require("express");
const router = express.Router();
const UserController = require("../controller/UserController");
const { Isauthentication } = require("../middleware/IsAuth");

router.route("/register").post(UserController.Register);
router.route("/login").post(UserController.login);
router.route("/all").get(Isauthentication, UserController.AllUsers);
router.route("/me").get(Isauthentication, UserController.userProfile);
router.route("/me/profile").patch(Isauthentication, UserController.updateUserProfile);
router.route("/password/update").patch(Isauthentication, UserController.updateUserPassword);
router.route("/follow").patch(Isauthentication, UserController.Following);
router.route("/unfollow").patch(Isauthentication, UserController.unfollowUser);
router.route("/verify-email").post(Isauthentication, UserController.generateVerificationTokenCtrl);
router.route("/block/:id").patch(Isauthentication, UserController.BlockUser);
router.route("/unblock/:id").patch(Isauthentication, UserController.UnBlockUser);
router.route("/profile/:id").get(Isauthentication, UserController.userProfileC);
router.route("/:id").delete(UserController.DeleteUser).get(UserController.SingleUser);

module.exports = router;
