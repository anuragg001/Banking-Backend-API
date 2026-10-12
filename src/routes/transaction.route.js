const { Router } = require("express");
const {
  authMiddleware,
  authSystemUserMiddlewware,
} = require("../middleware/auth.middleware");


const transactionRoutes = Router();

const transactionController = require("../controllers/transaction.controller");

/**
 * - @route   POST api/transactions
 * - @desc    Create a new transaction
 * - @access  Private
 */

transactionRoutes.post("/", authMiddleware, transactionController.createTransaction);

/**
 *  - @route POST /api/transactions/system/initial-fund
 * - @desc   Create a new transaction for system initial fund
 */
transactionRoutes.post(
  "/system/initial-fund",
  authSystemUserMiddlewware,
  transactionController.createInitalFundTransaction
);

module.exports = transactionRoutes;
