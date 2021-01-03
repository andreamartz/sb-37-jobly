/** Routes for companies using Jobly */

const db = require("../db");
const express = require("express");
const Company = require("../models/company");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const companySchemaNew = require("../schemas/companySchemaNew");
const companySchemaUpdate = require("../schemas/companySchemaUpdate");
const validateData = require("../helpers/validateData");

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
    const validationOutcome = validateData(req.body, companySchemaNew);

    // pass any validation errors to error handler
    if (validationOutcome instanceof Error) {
      return next(validationOutcome);
    }

    // at this point, the request data have been confirmed valid

    let { company } = req.body;
    company = await Company.create(company);
    return res.status(201).json({ company });
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
    const companyData = req.body.company;
    companyData.handle = companyData.handle.toUpperCase();

    // throw error if handle is not found for any company
    const companyCheck = await Company.findOne(handle);

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
    // do the update in the database; save to 'company' variable
    const company = await Company.update(handle, companyData);

    return res.json({company: company});
  } catch (err) {
      return next(err);
  }
});

router.delete("/:handle", async function (req, res, next) {
  try {
    const handle = req.params.handle.toUpperCase();
    
    // do the update in the database; save to 'company' variable
    const company = await Company.remove(handle);

    return res.json({message: "Company deleted"});
  } catch (err) {
      return next(err);
  }
});

module.exports = router;