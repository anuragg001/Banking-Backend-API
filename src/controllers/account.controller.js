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


async function getUserAccounts(req, res) {
  const accoounts = await accountModel.find({ user: req.user._id });

  res.status(200).json({
    message: "Accounts fetched successfully",
    accounts: accoounts
  })
}

async function getAccountById(req, res) {
  const { accountId } = req.params;
  const account = await accountModel.findById({
    _id: accountId,
    user: req.user._id
  });
  if (!account) {
    return res.status(404).json({
      message: "Account not found"
    })
  }
  const balance = await account.getBalance();
  res.status(200).json({
    message: "Account fetched successfully",
    account: {
      ...account.toObject(),
      balance
    }
  })


}


module.exports = {
  createAccount,
  getUserAccounts,
  getAccountById
}
