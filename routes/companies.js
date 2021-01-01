/** Routes for companies using Jobly */

const db = require("../db");
const express = require("express");
const Company = require("../models/company");
const router = new express.Router();
// const ExpressError = require("../helpers/expressError");
// const jsonschema = require("jsonschema");
const companySchemaNew = require("../schemas/companySchemaNew");
const companySchemaUpdate = require("../schemas/companySchemaUpdate");
const validateData = require("../helpers/validateData");
const ExpressError = require("../helpers/expressError");

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
    // validate data
    const outcome = validateData(req.body, companySchemaNew);

    // pass any validation errors to error handler
    if (outcome instanceof Error) {
      return next(outcome);
    }

    // at this point, the request data have been confirmed valid

    let { company } = req.body;
    company = await Company.create(company);
    return res.status(201).json({company});
  } catch (err) {
    return next(err);
  }
});

router.get("/:handle", async function (req, res, next) {
  try {
    const handle = req.params.handle.toLowerCase();
    const results = await Company.findOne(handle);
    return res.json({company: results});
  } catch(err) {
    return next(err);
  }
});

router.patch("/:handle", async function (req, res, next) {
  try {
    const handle = req.params.handle.toUpperCase();
    console.log("REQ.BODY: ", req.body);
    const companyData = req.body.company;
    companyData.handle = companyData.handle.toUpperCase();
    
    // throw error if user tries to update the handle
    if (companyData.handle.toUpperCase() !== handle) {
      throw new ExpressError('You cannot change the handle.', 400);
    }

    // validate the data on the request body
    const validationOutcome = validateData(req.body, companySchemaUpdate);

    // pass any validation errors to error handler
    if (validationOutcome instanceof Error) {
      return next(validationOutcome);
    }

    // at this point, the request data have been confirmed valid
    // do the update in the database; save to 'results' variable
    const company = await Company.update(handle, companyData);

    // check the length of the results array; if 0, throw new ExpressError("No such company was found", 404);
    if (company.length === 0) {
      throw new ExpressError("No such company was found", 404);
    }
    
    // if results.rows is longer than 1, return res.json(results.rows[0]);

    return res.json({company: company});
  } catch (err) {
      return next(err);
  }
});

module.exports = router;