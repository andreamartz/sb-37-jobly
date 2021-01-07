/** Routes for authenticating a user */

const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const createToken = require("../helpers/createToken");

router.post("/login", async function (req, res, next) {
  try {
    // Pull username and password from request body
    const data = req.body.user;
    // authenticate the user and get token
    const user = await User.authenticate(data);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;