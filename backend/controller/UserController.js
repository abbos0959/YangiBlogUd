const UserModel = require("../model/userModel");
const catchErrorAsync = require("../utils/catchUtil");
const AppError = require("../utils/appError");
const jwtToken = require("../utils/jwtToken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const sgMail = require("@sendgrid/mail");
const sendEmail = require("../utils/sendEmail");

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

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
   try {
      const followid = req.body.followid;

      const checkfollowid = await mongoose.Types.ObjectId.isValid(followid);
      if (!checkfollowid) {
         return next(new AppError("bunday idli user mavjud emas", 404));
      }

      const follower = await UserModel.findById(req.user._id);

      const check = await follower.following.includes(followid);
      if (check) {
         return next(new AppError("siz avval bu foydalanuvchiga obuna bo'lgansiz", 400));
      }

      await UserModel.findByIdAndUpdate(followid, {
         $push: { followers: follower },
         isfollowing: true,
      });

      await UserModel.findByIdAndUpdate(follower, {
         $push: { following: followid },
      });

      res.status(200).json({
         message: "siz obuna bo'dingiz",
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const unfollowUser = catchErrorAsync(async (req, res, next) => {
   try {
      const followid = req.body.followid;

      const checkfollowid = await mongoose.Types.ObjectId.isValid(followid);
      if (!checkfollowid) {
         return next(new AppError("bunday idli user mavjud emas", 404));
      }

      const follower = await UserModel.findById(req.user._id);

      await UserModel.findByIdAndUpdate(followid, {
         $pull: { followers: mongoose.Types.ObjectId(follower) },
         isfollowing: true,
      });

      await UserModel.findByIdAndUpdate(follower, {
         $pull: { following: mongoose.Types.ObjectId(followid) },
      });

      res.status(200).json({
         message: "siz obuna bekor qildingiz",
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const BlockUser = catchErrorAsync(async (req, res, next) => {
   try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
         return next(new AppError("bunday user mavjud emas", 400));
      }

      user.isblocked = true;
      await user.save();
      res.status(200).json({ message: "user blocklandi" });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});
const UnBlockUser = catchErrorAsync(async (req, res, next) => {
   try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
         return next(new AppError("bunday user mavjud emas", 400));
      }

      user.isblocked = false;
      await user.save();
      res.status(200).json({ message: "user blockdan ochildi" });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const generateVerificationTokenCtrl = catchErrorAsync(async (req, res) => {
   try {
      //build your message
      const user = await UserModel.findById(req.user._id);

      const verificationToken = await user.createAccountVerificationToken();
      await user.save();
      const message = `siz 10 daqiqa ichida emailingizni tasdiqlashingiz kerak <a href="http://localhost:3000/verify-account/${verificationToken}">Tasdiqlash</a> bosing`;
      console.log(verificationToken);
      await sendEmail({
         email: user.email,
         subject: "salom ukajon",
         message,
      });
      res.json({
         message: `${user.email} ga accaount tasdiqlash tokeni yuborildi`,
      });
   } catch (error) {
      res.json(error);
   }
});

module.exports = {
   generateVerificationTokenCtrl,
   UnBlockUser,
   BlockUser,
   Following,
   unfollowUser,
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
