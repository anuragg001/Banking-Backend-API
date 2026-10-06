const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth.controller");


// @route   POST api/auth/register
// @desc    Register user
// @access  Public

router.post("/register", authController.userRegisterController);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public

router.post("/login", authController.userLoginController);

module.exports = router;
