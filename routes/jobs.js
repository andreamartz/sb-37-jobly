/** Routes for companies using Jobly */

const db = require("../db");
const express = require("express");
const Job = require("../models/job");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const jobSchemaNew = require("../schemas/jobSchemaNew");
// const jobSchemaUpdate = require("../schemas/jobSchemaUpdate");
const validateData = require("../helpers/validateData");



// router.get("/", async function (req, res, next) {
//   try {
//     let {search, min_employees, max_employees} = req.query;
//     const data = {};

//     if (search !== undefined) {
//       search = search.toLowerCase();
//       data.search = search;
//     }

//     if (min_employees !== undefined) {
//       data.min_employees = min_employees;
//     }

//     if (max_employees !== undefined) {
//       data.max_employees = max_employees;
//     }

//     const results = await Company.findAll(data);

//     return res.json({companies: results});
//   } catch (err) {
//     return next(err);
//   }
// });

router.post("/", async function(req, res, next) {
  try {
    // validate data
    const validationOutcome = validateData(req.body, jobSchemaNew);

    // pass any validation errors to error handler
    if (validationOutcome instanceof Error) {
      return next(validationOutcome);
    }

    // at this point, the request data have been confirmed valid

    let { job } = req.body;
    // console.log("REQ.BODY: ", req.body);
    // console.log("JOB: ", job);
    job = await Job.create(job);
    // console.log("JOB AFTER DB: ", job);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;