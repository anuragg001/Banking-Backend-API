const mongoose = require("mongoose");


const tokenBlackListSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  }
},{timestamps: true});


// create ttl index to automatically remove expired tokens after 1 hour

tokenBlackListSchema.index({ createdAt: 1}, { expireAfterSeconds: 60 * 60 * 24 * 3}) // 3 days

const tokenBlackListModel = mongoose.model("TokenBlackList", tokenBlackListSchema);
module.exports = tokenBlackListModel;
