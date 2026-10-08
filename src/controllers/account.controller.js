const accountModel = require("../models/account.model");

async function createAccount(req, res) {
  // get the user id from the request object
  const user = req.user;

  const account = new accountModel({
    user: user._id
  })

  res.status(201).json({
    message: "Account created successfully",
    account: await account.save()
  })
}

module.exports = {
  createAccount,
}
