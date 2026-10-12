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
  /**
   * 1. Validate request
   */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "FromAccount, toAccount, amount and idempotencyKey are required",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount",
    });
  }

  /**
   * 2. Validate idempotency key
   */

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is still processing",
      });
    }

    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction processing failed, please retry",
      });
    }

    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry",
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
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be ACTIVE to process transaction",
    });
  }

  /**
   * 4. Derive sender balance from ledger
   */
  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`,
    });
  }

  let transaction;
  try {
    /**
     * 5. Create transaction (PENDING)
     */
    const session = await mongoose.startSession();
    session.startTransaction();

    transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "pending",
          },
        ],
        { session },
      )
    )[0];

    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: amount,
          transaction: transaction._id,
          type: "debit",
        },
      ],
      { session },
    );

    // just for testing the idempotency key 

    // await (() => {
    //   return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    // })();

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "credit",
        },
      ],
      { session },
    );

    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: "completed" },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    return res.status(400).json({
      message:
        "Transaction is Pending due to some issue, please retry after sometime",
    });
  }
  /**
   * 10. Send email notification
   */
  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
  );

  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction,
  });
}

async function createInitalFundTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (
    !toAccount ||
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !idempotencyKey
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!mongoose.isValidObjectId(toAccount)) {
    return res.status(400).json({ message: "Invalid destination account" });
  }

  const toUserAccount = await accountModel.findById(toAccount);
  if (!toUserAccount) {
    return res.status(404).json({ message: "Account not found" });
  }

  if (toUserAccount.status !== "active") {
    return res.status(400).json({ message: "Destination account is not active" });
  }

  const existingTransaction = await transactionModel.findOne({ idempotencyKey });
  if (existingTransaction) {
    return res.status(200).json({
      message: "Transaction already processed",
      transaction: existingTransaction,
    });
  }

  // The middleware guarantees that req.user is the system user.
  const fromUserAccount = await accountModel.findOne({ user: req.user._id });

  if (!fromUserAccount) {
    return res.status(404).json({ message: "System account not found" });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const [transaction] = await transactionModel.create(
      [{
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "pending",
      }],
      { session, ordered: true },
    );

    await ledgerModel.create(
      [
        {
          account: fromUserAccount._id,
          amount,
          transaction: transaction._id,
          type: "debit",
        },
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "credit",
        },
      ],
      { session, ordered: true },
    );

    transaction.status = "completed";
    await transaction.save({ session });
    await session.commitTransaction();

    return res.status(201).json({
      message: "Initial fund transaction completed successfully!!!",
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

module.exports = {
  createTransaction,
  createInitalFundTransaction,
};
