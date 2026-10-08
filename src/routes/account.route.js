const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();
const accountController = require('../controllers/account.controller');

/**
  * - POST /api/account
  * - Create a new account for the authenticated user.
  * - Protected route, requires authentication.
 */

router.post("/", authMiddleware, accountController.createAccount);









module.exports = router;
