/** Routes for users using Jobly */

const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const userSchemaUpdate = require("../schemas/userSchemaUpdate");
const validateData = require("../helpers/validateData");
const { authenticateJWT, correctUserRequired } = require("../middleware/auth");


router.get("/", async function (req, res, next) {
  try {
    const results = await User.findAll();
    return res.json({users: results});
  } catch (err) {
    return next(err);
  }
});

router.get("/:username", async function (req, res, next) {
  try {
    const username = req.params.username.toLowerCase();
    const result = await User.findOne(username);
    return res.json({user: result});
  } catch(err) {
    return next(err);
  }
});

router.patch("/:username", authenticateJWT, correctUserRequired, async function (req, res, next) {
  try {
    const username = req.params.username.toLowerCase();
    const userData = req.body.user;

    // throw error if username is not found for any user
    const UserCheck = await User.findOne(username);

    if (userData.username) {
      userData.username = userData.username.toLowerCase();
      // throw error if user tries to update the username
      if (userData.username !== username) {
        throw new ExpressError('You cannot change the username.', 400);
      }
    }

    // validate the data on the request body
    const validationOutcome = validateData(req.body, userSchemaUpdate);

    // pass any validation errors to error handler
    if (validationOutcome instanceof Error) {
      return next(validationOutcome);
    }

    // at this point, the request data have been confirmed valid
    // do the update in the database; save to 'user' variable
    const user = await User.update(username, userData);

    return res.json({ user });
  } catch (err) {
      return next(err);
  }
});

router.delete("/:username", authenticateJWT, correctUserRequired, async function (req, res, next) {
  try {
    const username = req.params.username.toUpperCase();
    
    // do the update in the database; save to 'user' variable
    const user = await User.remove(username);

    return res.json({message: "User deleted"});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;