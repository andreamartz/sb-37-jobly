/** Middleware to handle various auth cases in routes */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

/** Verify the user's auth JWT token, and
 *  add authorized user (if any) to the request */
function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    // jwt.verify will throw error if '_token' not on body of request
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    // if we get to here, no error was thrown by jwt
    req.user = payload;
    console.log("Hey! authenticateJWT middleware ran!");
    return next();
  } catch(err) {
    // error in this middleware is not an error -- continue on
    return next();

  }
}

/** Find user on request or raise error */
function authRequired(req, res, next) {
  if (!req.user) {
    const err = new ExpressError("You must login first.", 401);
    return next(err);
  } else {
    return next();
  }
}

/** Verify that user is an admin or raise error */
function adminRequired(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    const err = new ExpressError("Unauthorized; you don't have admin rights", 401);
    return next(err);
  } else {
    return next();
  }
}

/** Ensure that the user making the request is the same one specified in the URL path params */
function ensureCorrectUser(req, res, next) {
  if (!req.user || req.user.username !== req.params.username) {
    const err = new ExpressError("Unauthorized", 401);
    return next(err);
  } else {
    return next();
  }
}

module.exports = {
  authenticateJWT,
  authRequired,
  adminRequired,
  ensureCorrectUser
};