require("dotenv").config();
const colors = require("colors");
const DB = require("./db/db");
DB();
const app = require("./middleware/app");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
   console.log("server ishladi".bgBlue.bold);
});
