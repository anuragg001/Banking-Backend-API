const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      default: "active",
      enum: {
        values: ["active", "inactive", "suspended"],
        message: "Status can be either active, inactive, suspended",
        default: "active",
      },
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
  },
  { timestamps: true },
);

accountSchema.index({ user: 1, status: 1 }, { unique: true }); // one account per user and status

accountSchema.methods.getBalance = async function () {
  const balanceData = await ledgerModel.aggregate([
    { $match: { account: this._id } },

    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [
              { $eq: ["$type", "debit"] },
              "$amount",
              0
            ]
          }
        },
        totalCredit: {
          $sum: {
            $cond: [
              { $eq: ["$type", "credit"] },
              "$amount",
              0
            ]
          }
        },

      }
    },
    {
      $project: {
        _id: 0,
        balance: {$subtract: ["$totalCredit", "$totalDebit"]}
      }
    }
  ]);

  if (balanceData.length === 0) {
    return 0;
  }
  return balanceData[0].balance;
};

const accountModel = mongoose.model("Account", accountSchema);

module.exports = accountModel;
