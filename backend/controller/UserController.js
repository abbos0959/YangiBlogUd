const UserModel = require("../model/userModel");
const catchErrorAsync = require("../utils/catchUtil");
const AppError = require("../utils/appError");
const jwtToken = require("../utils/jwtToken");
const bcrypt = require("bcrypt");

const Register = catchErrorAsync(async (req, res, next) => {
   try {
      const { firstname, lastname, email, password } = req.body;

      if (password.toString().length < 3) {
         return next(
            new AppError("Parol uzunligi kamida 3 ta belgidan iborat bo'lishi kerak", 400)
         );
      }
      if (password.toString().length > 16) {
         return next(new AppError("Parol uzunligi  15 ta belgidan  oshmasligi kerak", 400));
      }

      const hash = await bcrypt.hash(password.toString(), 10);

      const isuser = await UserModel.findOne({ email });
      if (isuser) {
         return res.status(400).json({ message: "Bunday user allaqachon mavjud" });
      }

      const user = await UserModel.create({
         firstname,
         lastname,
         email,
         password: hash,
      });

      jwtToken(user, 200, res);
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

module.exports = { Register };
