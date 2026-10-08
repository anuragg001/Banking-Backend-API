const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");


async function authMiddleware(req, res, next) {
  // check if the request has a cookie named "token" or "Authorization" header with a Bearer token

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if(!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // now verify the token using jwt.verify
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // you will get user id
    const user = await userModel.findById(decoded.id).select("-password"); // get user without password

    // save the user in the request object for future use
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

module.exports = authMiddleware;
