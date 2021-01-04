/** Routes for users using Jobly */

const db = require("../db");
const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const userSchemaNew = require("../schemas/userSchemaNew");
// const userSchemaUpdate = require("../schemas/userSchemaUpdate");
const validateData = require("../helpers/validateData");

router.post("/", async function(req, res, next) {
  try {
    // validate data
    const validationOutcome = validateData(req.body, userSchemaNew);

    // pass any validation errors to error handler
    if (validationOutcome instanceof Error) {
      return next(validationOutcome);
    }

    // at this point, the request data have been confirmed valid
    let user = req.body.user;
    user = await User.register(user);
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;