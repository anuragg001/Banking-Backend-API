const mongoose = require('mongoose');


function connectDB() {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
    console.log("Connect to db");

    })
    .catch((err) => {
      console.log("Error connecting to db");
      process.exit(1);
    })
}

module.exports = connectDB;
