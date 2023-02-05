const express = require("express");
const router = express.Router();
const UserController = require("../controller/UserController");

router.route("/register").post(UserController.Register);
router.route("/login").post(UserController.login);
router.route("/all").get(UserController.AllUsers);
router.route("/:id").delete(UserController.DeleteUser).get(UserController.SingleUser);

module.exports = router;
