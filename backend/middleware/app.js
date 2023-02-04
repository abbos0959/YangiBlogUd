const express = require("express");
const ErrorController = require("../controller/errorController");
const UserRouter = require("../router/userRouter");
const app = express();
app.use(express.json());

app.use("/api/user", UserRouter);

app.use(ErrorController);

module.exports = app;
