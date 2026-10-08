const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");
/**
 *- Create a new transaction and update the ledger accordingly
 * The 11-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. validate idempotency key
 * 3. check account status
 * 4. derive sender balance from ledger
 * 5. Create txn (status: pending)
 * 6. Create ledger entry for sender (type: debit)
 * 7. Create ledger entry for receiver (type: credit)
 * 8. Update txn (status: completed)
 * 9. Return response (Commit mongodb session)
 * 10. Handle errors and rollback if necessary
 * 11. send email notification to both parties (async)
 */
async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  /**
   * 1. Validate request
   */
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  //check if both the account exist or not
  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(404).json({ message: "One or both accounts not found" });
  }

  /**
   * Validater Idempotency Key
   */

  const isTransactionAlreadyExist = await transactionModel.findOne({
    idempotencyKey,
  });

  if (isTransactionAlreadyExist) {
    if (isTransactionAlreadyExist.status === "completed") {
      return res.status(200).json({
        message: "Transaction already completed",
        transaction: isTransactionAlreadyExist,
      });
    }

    if (isTransactionAlreadyExist.status === "pending") {
      return res.status(202).json({
        message: "Transaction is still pending",
        transaction: isTransactionAlreadyExist,
      });
    }

    if (isTransactionAlreadyExist.status === "failed") {
      return res.status(500).json({
        message: "Transaction has failed",
        transaction: isTransactionAlreadyExist,
      });
    }

    if (isTransactionAlreadyExist.status === "reversed") {
      return res.status(409).json({
        message: "Transaction has been reversed",
        transaction: isTransactionAlreadyExist,
      });
    }
  }

  /**
   * 3. Check account status
   */

  if (
    fromUserAccount.status !== "active" ||
    toUserAccount.status !== "active"
  ) {
    return res
      .status(400)
      .json({ message: "One or both accounts are not active" });
  }

  /**
   * 4. Derive sender balance from ledger
   */
  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res
      .status(400)
      .json({ message: `Insufficient balance. Current balance: ${balance}` });
  }

  /**
   *5. Create txn (status: pending)
   */

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await transactionModel.create(
    {
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: "pending",
    },
    { session },
  );

  /**
   * 6. Create ledger entry for sender (type: debit)
   */

  const debitLedgerEntry = await ledgerModel.create(
    {
      account: fromAccount,
      amount,
      transaction: transaction._id,
      type: "debit",
    },
    { session },
  );

  /**
   * 7. Create ledger entry for receiver (type: credit)
   */

  const creditLedgerEntry = await ledgerModel.create(
    {
      account: toAccount,
      amount,
      transaction: transaction._id,
      type: "credit",
    },
    { session },
  );

  /**
   * 8. Update txn (status: completed)
   */

  transaction.status = "completed";
  await transaction.save({ session });

  /**
   * 9. Return response (Commit mongodb session)
   */

  await session.commitTransaction();
  session.endSession();

  /**
   * 11. send email notification to both parties (async)
   */

  await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);

  
    return res.status(201).json({
      message: "Txn completed successfully!!!",
      transaction:transaction
    })

}

module.exports = {
  createTransaction,
};
