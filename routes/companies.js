/** Routes for companies using Jobly */

const express = require("express");
const Company = require("../models/company");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const companySchemaNew = require("../schemas/companySchemaNew");
const companySchemaUpdate = require("../schemas/companySchemaUpdate");
const validateData = require("../helpers/validateData");
const { authenticateJWT, authRequired, adminRequired } = require("../middleware/auth");

/** 
 * GET /: gets all companies
 * 
 * Auth: requires login
 * 
 * Returns object with companies key containing array of company objects
 * 
 * { _token: _token }
 * =>
 * { 
 *   "companies": [
 *     {
 *        handle: handle,
 *        name: name
 *     },
 *     {
 *        handle: handle,
 *        name: name
 *     },
 *     { ... },
 *     { ... }
 *   ]
 * }
 */
router.get("/", authenticateJWT, authRequired, async function (req, res, next) {
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

/** 
 * GET /:id gets a company's details
 * 
 * Auth: requires login
 * 
 * Returns object with "company" key that contains a company object with property jobs (an object containing an array of job objects)
 * 
 *  * { _token: _token }
 * =>
 * { 
 *   company: {
 *       handle: handle,
 *       name: name,
 *       num_employees: num_employees,
 *       description: description,
 *       logo_url: logo_url,
 *     jobs: [
 *       {
 *         id: id,
 *         title: title,
 *         salary: salary,
 *         equity: equity,
 *         company_handle: company_handle,
 *         date_posted: date_posted,}]
 *       },
 *       {
 *         id: id,
 *         title: title,
 *         salary: salary,
 *         equity: equity,
 *         company_handle: company_handle,
 *         date_posted: date_posted,}]
 *       },
 *       { ... },
 *       { ... }
 *     ]
 *   }
 * }
 */
router.get("/:handle", authenticateJWT, authRequired, async function (req, res, next) {
  try {
    const handle = req.params.handle.toUpperCase();
    const results = await Company.findOne(handle);
    return res.json({company: results});
  } catch(err) {
    return next(err);
  }
});

/** 
 * POST / creates a new job
 * 
 * Auth: admin rights are required
 * 
 * { 
 *   company: { 
 *     handle: handle,
 *     name: name,
 *     num_employees: num_employees,
 *     description: description,
 *     logo_url: logo_url,
 *   },
 *   _token: token 
 * } 
 * => 
 * { 
 *   company: { 
 *     handle: handle,
 *     name: name,
 *     num_employees: num_employees,
 *     description: description,
 *     logo_url: logo_url,
 *   }
 * } 
 * 
 */
router.post("/", authenticateJWT, adminRequired, async function(req, res, next) {
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

/** 
 * PATCH /:id updates a company's details
 * 
 * Auth needed: must be an admin
 * 
 * Fields that can be updated: name, num_employees, description, logo_url
 * 
 * {
 *    company: {
 *      name: name,
 *      num_employees: num_employees,
 *      description: description,
 *      logo_url: logo_url,
 *    },
 *    _token: _token
 *   }
 * => 
 * {
 *    company: {
 *      handle: handle,
 *      name: name,
 *      num_employees: num_employees,
 *      description: description,
 *      logo_url: logo_url
 *    }
 * } 
 */
router.patch("/:handle", authenticateJWT, adminRequired, async function (req, res, next) {
  try {
    const handle = req.params.handle.toUpperCase();
    const companyData = req.body.company;

    // throw error if handle is not found for a company
    const companyCheck = await Company.findOne(handle);

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

/** 
 * DELETE /:id deletes a company
 * 
 * Auth needed: must be an admin
 * 
 * Input: _token
 * 
 * {
 *    _token: _token
 *  }
 * => 
 * {
 *   message: "Company deleted"
 * } 
 */
router.delete("/:handle", authenticateJWT, adminRequired, async function (req, res, next) {
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