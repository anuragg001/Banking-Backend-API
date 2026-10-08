const mongoose = require('mongoose');


const transactionSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ["pending", "completed", "failed", "reversed"],
      message: "Status can be either pending, completed, failed, reversed",
    },
    default: "pending",
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount must be positive"]
  },
  idempotencyKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  }

}, { timestamps: true });


const transactionModel = mongoose.model('Transaction', transactionSchema);

module.exports = transactionModel;

