const express = require("express");
const router = express.Router();
const UserController = require("../controller/UserController");

router.route("/register").post(UserController.Register);

module.exports = router;
