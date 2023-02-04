const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
   {
      firstname: {
         type: String,
         required: [true, "Familiya kiritishingiz shart"],
      },
      lastname: {
         type: String,
         required: [true, "Ism kiritishingiz shart"],
      },
      email: {
         type: String,
         required: [true, "email  kiritishingiz shart"],
      },
      password: {
         type: String,
         required: [true, "siz parol kiritishingiz shart"],
      },
      profilephoto: {
         type: String,
         default:
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
      },
      bio: {
         type: String,
      },
      postcount: {
         type: Number,
         default: 0,
      },
      isblocked: {
         type: Boolean,
         default: false,
      },
      isadmin: {
         type: Boolean,
         default: false,
      },
      role: {
         type: String,
         enum: ["admin", "guest", "blogger"],
      },
      isfollowing: {
         type: Boolean,
         default: false,
      },
      isunfollowing: {
         type: Boolean,
         default: false,
      },
      isaccountverified: {
         type: Boolean,
         default: false,
      },
      accountverificationtoken: String,

      accountverificationexpired: Date,
      viewedby: {
         type: [
            {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Users",
            },
         ],
      },
      followers: {
         type: [
            {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Users",
            },
         ],
      },
      following: {
         type: [
            {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Users",
            },
         ],
      },
      active: { type: Boolean, default: false },
      passwordchangeat: Date,
      passwordresettoken: String,
      passwordresetexpires: Date,
   },

   {
      timestamps: true,
      toObject: {
         virtuals: true,
      },
      toJSON: {
         virtuals: true,
      },
   }
);

module.exports = mongoose.model("Users", userSchema);
