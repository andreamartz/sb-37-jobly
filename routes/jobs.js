/** Routes for companies using Jobly */

const express = require("express");
const Job = require("../models/job");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const jobSchemaNew = require("../schemas/jobSchemaNew");
const jobSchemaUpdate = require("../schemas/jobSchemaUpdate");
const validateData = require("../helpers/validateData");
const { authenticateJWT, authRequired, adminRequired } = require("../middleware/auth");

/** 
 * GET /: gets all jobs
 * 
 * Auth: requires login
 * 
 * Returns object with jobs key containing array of job objects
 * 
 * { _token: _token }
 * =>
 * { 
 *   "jobs": [
 *     {
 *        title: title,
 *        company_handle: company_handle
 *     },
 *     {
 *        title: title,
 *        company_handle: company_handle
 *     },
 *     { ... },
 *     { ... }
 *   ]
 * }
 */
router.get("/", authenticateJWT, authRequired, async function (req, res, next) {
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

/** 
 * GET /:id gets a job's details
 * 
 * Auth: requires login
 * 
 * Returns object with "job" key that contains a job object with property company (an object containing company details)
 * 
 *  * { _token: _token }
 * =>
 * { 
 *   job: {
 *     id: id,
 *     title: title,
 *     salary: salary,
 *     equity: equity,
 *     company_handle: company_handle,
 *     date_posted: date_posted,
 *     company: {
 *       handle: handle,
 *       name: name,
 *       num_employees: num_employees,
 *       description: description,
 *       logo_url: logo_url
 *     }
 *   }
 * }
 */
router.get("/:id", authenticateJWT, authRequired, async function (req, res, next) {
  try {
    const id = req.params.id;
    const job = await Job.findOne(id);
    return res.json({ job });
  } catch (err) {
    return next (err);
  }
});

/** 
 * POST / creates a new job
 * 
 * Auth: admin rights are required
 * 
 * { 
 *   job: { 
 *     title: title,
 *     salary: salary, 
 *     equity: equity, 
 *     company_handle: company_handle 
 *   },
 *   _token: token 
 * } 
 * => 
 * { 
 *   job: {
 *     id: id,
 *     title: title,
 *     salary: salary,
 *     equity: equity,
 *     company_handle: company_handle,
 *     date_posted: date_posted
 *   }
 * }
 * 
 */
router.post("/", authenticateJWT, adminRequired, async function(req, res, next) {
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

/** 
 * PATCH /:id updates a job's details
 * 
 * Auth needed: must be an admin
 * 
 * Fields that can be updated: title, salary, equity, company_handle, date_posted
 * 
 * {
      job: {
        title: title,
        salary: salary,
        equity: equity
      },
      _token: _token
    }
 * => 
 * {
 *   job: {
 *     id: id,
 *     title: title,
 *     salary: salary,
 *     equity: equity,
 *     company_handle: company_handle,
 *     date_posted: date_posted
 *   }
 * } 
 */

router.patch("/:id", authenticateJWT, adminRequired, async function (req, res, next) {
  try {
    const id = req.params.id;
    const jobData = req.body.job;
    
    // throw error if id is not found for any job
    const jobCheck = await Job.findOne(id);

    // throw error if user tries to update the id
    if (jobData.id && jobData.id !== +id) {
      throw new ExpressError('You cannot change the job id.', 400);
    }

    // validate the data on the request body
    const validationOutcome = validateData(req.body, jobSchemaUpdate);

    // pass any validation errors to error handler
    if (validationOutcome instanceof Error) {
      return next(validationOutcome);
    }

    // at this point, the request data have been confirmed valid
    // do the update in the database; save to 'job' variable
    const job = await Job.update(id, jobData);

    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** 
 * DELETE /:id deletes a job
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
 *   message: "Job deleted"
 * } 
 */
router.delete("/:id", authenticateJWT, adminRequired, async function (req, res, next) {
  try {
    const id = req.params.id;
    
    // do the update in the database; save to 'job' variable
    const job = await Job.remove(id);
    return res.json({message: "Job deleted"});
  } catch (err) {
      return next(err);
  }
});

module.exports = router;