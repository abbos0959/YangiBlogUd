const express = require("express");
const ErrorController = require("../controller/errorController");
const UserRouter = require("../router/userRouter");
const app = express();
app.use(express.json());

app.use("/api/user", UserRouter);

app.all("*", (req, res) => {
   res.status(404).json({
      message: ` bunday${req.originalUrl} mavjud emas`,
   });
});

app.use(ErrorController);

module.exports = app;
