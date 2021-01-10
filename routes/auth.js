/** Routes for authenticating a user */
const userSchemaNew = require("../schemas/userSchemaNew");
const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const createToken = require("../helpers/createToken");
const validateData = require("../helpers/validateData");

/** 
 * post: registers a new user
 * 
 * { user: { username, first_name, last_name, email, photo_url, password, is_admin }}  => { token }
 * 
 * token's payload contains username and is_admin properties
 */
router.post("/register", async function(req, res, next) {
  try {
    // validate data
    const validationOutcome = validateData(req.body, userSchemaNew);
    console.log("VALIDATIONOUTCOME: ", validationOutcome);
    // pass any validation errors to error handler
    if (validationOutcome instanceof Error) {
      return next(validationOutcome);
    }

    // at this point, the request data have been confirmed valid
    let user = req.body.user;
    // register the user and get token
    user = await User.register(user);
    const token = createToken(user);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

/**
 * Log in requests need a user object on the request body and they return a signed token:
 * 
 * { user: { username, password}} => { token }
 * 
 * token contains username, password, is_admin properties
 */
router.post("/login", async function (req, res, next) {
  try {
    // Pull user object from request body
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