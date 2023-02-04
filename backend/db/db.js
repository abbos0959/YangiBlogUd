const mongoose = require("mongoose");

const DB = async () => {
   try {
      await mongoose.connect(process.env.URL);
      console.log("MONGODB ULANDIIII".bgGreen.bold);
   } catch (error) {
      console.log("MONGODB ULANMADI".bgRed.bold);
   }
};

module.exports = DB;
