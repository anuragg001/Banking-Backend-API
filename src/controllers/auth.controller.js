const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email");

/*
 *  @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 * user register controller and validation
 */

async function userRegisterController(req, res) {
  // data received from the request body

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "Please Provide all required fields" });
  }

  // validate the data
  const isExist = await userModel.findOne({ email: email });
  if (isExist) {
    return res.status(400).json({ message: "User already exists" });
  }

  //create a new user
  const user = await userModel.create({ email, password, name });

  //create a jwt token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.cookie("token", token);

  res.status(201).json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    token: token
  })

  // always send a registration email after successful registration

  await emailService.sendRegisterationEmail(user.email, user.name);
}


/*
 *  @desc    Login a user
 * @route   POST /api/auth/login
 * @access  Public
 * user login controller and validation
 */

async function userLoginController(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please Provide all required fields" });
  }

  const user = await userModel.findOne({ email: email }).select("+password");

  if (!user) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }

  //check the pass
  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }

  //generate a jwt token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.cookie("token", token);

  return res.status(200).json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    token: token
  });
}




module.exports = {
  userRegisterController,
  userLoginController
}
