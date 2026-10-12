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

// @route   POST api/auth/logout
// @desc    Logout user
// @access  Private

router.post("/logout", authController.userLogoutController);

module.exports = router;
