/** Middleware to handle various auth cases in routes */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

/** 
 * Verify the user's auth JWT token, and
 *  add authorized user (if any) to the request 
 */
function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    // jwt.verify will throw error if '_token' not on body of request
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    // if we get to here, no error was thrown by jwt.verify
    req.user = payload;
    console.log("Hey! authenticateJWT middleware ran with no problem!");
    return next();
  } catch(err) {
    // error in this middleware is not one we care about -- continue on
    console.log("ERR: ", err, "No token was found; authenticateJWT middleware returned an error, but continue on...");
    return next();
  }
}

/** 
 * Find authenticated user on the request or raise error 
*/
function authRequired(req, res, next) {
  try {
    // if no valid user info found (because no valid token was passed in)
    if (!req.user) {
      throw new ExpressError("You must login first.", 401);
    } 
    console.log("authRequired middleware ran with no problem");
    return next();
  } catch (err) {
    console.log("authRequired middleware threw an error");
    return next(err);
  }
}

/** 
 * Verify that user is an authenticated admin or raise error 
*/
function adminRequired(req, res, next) {
  try {
    // if no valid user info found OR user is not an admin
    if (!req.user || !req.user.is_admin) {
      throw new ExpressError("Unauthorized; you don't have admin rights", 401);
    }
    console.log("adminRequired middleware ran with no problem");
    return next();
  } catch (err) {
    console.log("adminRequired middleware threw an error");
    return next(err);
  }
}

/** 
 * Ensure that the user making the request is the same one specified in the URL path params
*/
function correctUserRequired(req, res, next) {
  try {
    // if no valid user info found OR username does not match username in req.params
    if (!req.user || req.user.username !== req.params.username) {
      throw new ExpressError("Unauthorized", 401);
    }
    console.log("correctUserRequired middleware ran with no problem");
    return next();
  } catch (err) {
    console.log("correctUserRequired middleware threw an error");
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  authRequired,
  adminRequired,
  correctUserRequired
};