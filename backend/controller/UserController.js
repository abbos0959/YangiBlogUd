const UserModel = require("../model/userModel");
const catchErrorAsync = require("../utils/catchUtil");
const AppError = require("../utils/appError");
const jwtToken = require("../utils/jwtToken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

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

const login = catchErrorAsync(async (req, res, next) => {
   try {
      const { email, password } = req.body;

      if (!email || !password) {
         return next(new AppError("siz email yoki parolni kiritmadingiz", 400));
      }
      const olduser = await UserModel.findOne({ email });
      if (!olduser) {
         return next(new AppError("bunday user mavjud emas", 400));
      }

      const ispassword = await bcrypt.compare(password.toString(), olduser.password);
      if (!ispassword) {
         return next(new AppError("Iltimos parolni tekshirib qaytadan tering"));
      }
      jwtToken(olduser, 200, res);
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const AllUsers = catchErrorAsync(async (req, res, next) => {
   try {
      console.log(req.headers, "headercha", req.cookies);

      const alluser = await UserModel.find();

      res.status(200).json({
         message: "success",
         alluser,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const DeleteUser = catchErrorAsync(async (req, res, next) => {
   try {
      const id = req.params.id;
      const user = await UserModel.findByIdAndDelete(id);
      if (!user) {
         return next(new AppError("bunday foydalanuvchi mavjud emas", 400));
      }
      res.status(200).json({
         message: "success",
         user,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});
const SingleUser = catchErrorAsync(async (req, res, next) => {
   try {
      const { id } = req.params;
      const usercheckId = await mongoose.Types.ObjectId.isValid(id);

      const user = await UserModel.findById(id);
      if (!user) {
         return next(new AppError("bunday user mavjud emas", 400));
      }
      res.status(200).json({
         message: "success",
         user,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const userProfile = catchErrorAsync(async (req, res, next) => {
   try {
      console.log(req.user.id);
      const user = await UserModel.findById(req.user.id);
      res.status(200).json({
         user,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const userProfileC = catchErrorAsync(async (req, res, next) => {
   try {
      console.log(req.user.id);
      const user = await UserModel.findById(req.params.id);
      res.status(200).json({
         user,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const updateUserProfile = catchErrorAsync(async (req, res, next) => {
   try {
      const user = await UserModel.findByIdAndUpdate(req.user._id, req.body);
      if (!user) {
         return next(new AppError("Update bo'lmadi", 400));
      }
      res.status(200).json({
         message: "success",
         user,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const updateUserPassword = catchErrorAsync(async (req, res, next) => {
   const user = await UserModel.findById(req.user._id);

   const comparePassword = await bcrypt.compare(req.body.oldpassword.toString(), user.password);
   if (!comparePassword) {
      return next(new AppError("parol yoki email xato", 400));
   }

   user.password = await bcrypt.hash(req.body.newPassword.toString(), 10);
   await user.save();
   jwtToken(user, 200, res);
});

const Following = catchErrorAsync(async (req, res, next) => {

});

module.exports = {
   Following,
   updateUserPassword,
   Register,
   login,
   AllUsers,
   DeleteUser,
   SingleUser,
   userProfile,
   updateUserProfile,
   userProfileC,
};
