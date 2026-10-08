const mongoose = require('mongoose');


const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    default: "active",
    enum: {
      values: ["active", "inactive", "suspended"],
      message: "Status can be either active, inactive, suspended",
      default: "active"
    },
  },
  currency: {
    type: String,
    required: true,
    default: "INR",
  },

}, { timestamps: true })


accountSchema.index({ user: 1, status: 1 }, { unique: true }) // one account per user and status


const accountModel = mongoose.model('Account', accountSchema);

module.exports = accountModel;
