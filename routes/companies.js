/** Routes for companies using Jobly */

const db = require("../db");
const express = require("express");
const Company = require("../models/company");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const companySchemaNew = require("../schemas/companySchemaNew");


router.get("/", async function (req, res, next) {
  try {
    let {search, min_employees, max_employees} = req.query;
    const data = {};

    if (search !== undefined) {
      search = search.toLowerCase();
      data.search = search;
    }

    if (min_employees !== undefined) {
      data.min_employees = min_employees;
    }

    if (max_employees !== undefined) {
      data.max_employees = max_employees;
    }

    const results = await Company.findAll(data);

    return res.json({companies: results});
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function(req, res, next) {
  try {
    const result = jsonschema.validate(req.body, companySchemaNew);
    console.log("result.valid: ", result.valid);

    if (!result.valid) {
      // pass validation errors to error handler
      console.log("result.errors: ", result.errors);
      const listOfErrors = result.errors.map(error => error.stack);
      console.log("listOfErrors: ", listOfErrors);
      const error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    // at this point in the code, we know we have a valid payload
    console.log("req.body: ", req.body);

    let { company } = req.body;

    company = await Company.create(req.body.company);
    return res.status(201).json({company});
  } catch (err) {
    next(err);
  }
});

router.get("/:handle", async function (req, res, next) {
  try {
    const handle = req.params.handle.toLowerCase();
    const results = await Company.findOne(handle);
    return res.json({company: results});
  } catch(err) {
    next(err);
  }
});

module.exports = router;