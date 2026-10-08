const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();


app.use(express.json());
app.use(cookieParser());

/**
 * - Routes required for the application
 */
const authRouter = require("./routes/auth.route");
const accountRouter = require("./routes/account.route");
const transactionRoutes = require("./routes/transaction.route");


/**
 * - Using  the routes
 */
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions",transactionRoutes); 




module.exports = app;
