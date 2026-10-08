const { Router } = require("express");
const authMiddleware = require("../middleware/auth.middleware");


const transactionRoutes = Router();

const transactionController = require("../controllers/transaction.controller");

/**
 * - @route   POST api/transactions
 * - @desc    Create a new transaction
 * - @access  Private
 */

transactionRoutes.post("/",authMiddleware, transactionController.createTransaction);


module.exports = transactionRoutes;
