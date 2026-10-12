const mongoose = require("mongoose");

function connectDB() {
  const mongoUri = new URL(process.env.MONGO_URI);

  mongoose
    .connect(mongoUri.toString())
    .then(() => {
      console.log("Connected to db");
    })
    .catch((error) => {
      console.error("Error connecting to db:", error.message);
      process.exit(1);
    });
}

module.exports = connectDB;
