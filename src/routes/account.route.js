const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const router = express.Router();
const accountController = require('../controllers/account.controller');

/**
  * - POST /api/account
  * - Create a new account for the authenticated user.
  * - Protected route, requires authentication.
 */

router.post("/", authMiddleware, accountController.createAccount);



/**
 *  - GET /api/accounts
 * - Get all accounts of loggedin user
 * - Protected route, requires authentication.
 */
router.get("/", authMiddleware, accountController.getUserAccounts);


/**
 * - GET  /api/account/balance/:accountId
 * - Get the balance of a specific account.
 * - Protected route, requires authentication.
 */

  router.get("/balance/:accountId", authMiddleware, accountController.getAccountById);


module.exports = router;
