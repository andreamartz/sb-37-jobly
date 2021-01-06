/** Auth JWT toden, add authorized user (if any) to the request */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

/** Auth JWT token, add authorized user (if any) to the request */
function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user = payload;
    console.log("TOKEN IS VALID");
    return next();
  } catch(err) {
    // error in this middleware isn not an error -- continue on
    return next();
  }
}

/** Find user on request or raise error */
function authRequired(req, res, next) {
  if (!req.user) {
    const err = new ExpressError("Unauthorized", 401);
    return next(err);
  } else {
    return next();
  }
}

function adminRequired(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    const err = new ExpressError("Unauthorized", 401);
    return next(err);
  } else {
    return next();
  }
}

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