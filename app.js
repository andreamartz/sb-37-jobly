/** Express app for jobly. */

const express = require("express");
const ExpressError = require("./helpers/expressError");
// require the logging package
const morgan = require("morgan");
const { authenticateJWT, authRequired, adminRequired, ensureCorrectUser } = require("./middleware/auth");

const app = express();

const companyRoutes = require("./routes/companies");
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

/** 
 * Middleware to run for every request 
 */
app.use(express.json());  // parse incoming request body as JSON
app.use(authenticateJWT);  // verify token


app.use(morgan("dev"))  // http request logging system
app.use("/companies", companyRoutes);
app.use("/jobs", jobRoutes);
app.use("/users", userRoutes);
app.use("/", authRoutes);


/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.error(err.stack);

  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
