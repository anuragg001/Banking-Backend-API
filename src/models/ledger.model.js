const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
    index: true,
    immutable: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount must be positive"],
    immutable: true
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: true,
    index: true,
    immutable: true
  },
  type: {
    type: String,
    enum: {
      values: ["credit", "debit"],
      message: "Type can be either credit or debit",
    },
    required: true,
    immutable: true
  }
}, { timestamps: true });

// since Ledger is a single source of truth for account balances, we can create a unique index on account and transaction to ensure that there is only one ledger entry per transaction per account

function preventLedgerModification() {
  throw new Error("Ledger entries are immutable and cannot be modified");
}

//when this function will run

ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);
ledgerSchema.pre('replaceOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);



const ledgerModel = mongoose.model("Ledger", ledgerSchema);

module.exports = ledgerModel;
