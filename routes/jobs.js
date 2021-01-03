/** Routes for companies using Jobly */

const db = require("../db");
const express = require("express");
const Job = require("../models/job");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const jobSchemaNew = require("../schemas/jobSchemaNew");
// const jobSchemaUpdate = require("../schemas/jobSchemaUpdate");
const validateData = require("../helpers/validateData");


router.get("/", async function (req, res, next) {
  try {
    let { search, min_salary, min_equity } = req.query;
    const data = {};

    if (search !== undefined) {
      search = search.toLowerCase();
      data.search = search;
    }

    if (min_salary !== undefined) {
      data.min_salary = min_salary;
    }

    if (min_equity !== undefined) {
      data.min_equity = min_equity;
    }

    const results = await Job.findAll(data);

    return res.json({jobs: results});
  } catch (err) {
    return next(err);
  }
});

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

    job = await Job.create(job);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;