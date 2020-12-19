/** Routes for companies using Jobly */

const db = require("../db");
const express = require("express");
const Company = require("../models/company");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
// const jsonschema = require("jsonschema");


router.get("/", async function (req, res, next) {
  try {
    const data = {};
    if (req.query.search) {
      let { search } = req.query;
      search = search.toLowerCase();
      console.log("search: ", search);
      console.log("req.query: ", req.query);
      data.search = search;
      console.log("data: ", data);
    }

    const results = await Company.findAll(data);

    return res.json({companies: results});
  } catch (err) {
    return next(err);
  }

});

// router.get("/search", async function (req, res, next) {
//   const results = await db.query(
//     `SELECT 
//       handle, 
//       name, 
//       num_employees, 
//       description, 
//       logo_url
//     FROM companies
//     WHERE handle=$1`, 
//     [handle]
//   );
//   if (results.rows.length === 0) {
//     throw { message: `There is no company with handle ${handle}`, status: 404 }
//   }
//   console.log("results: ", results);
//   console.log("results.rows[0]: ", results.rows[0]);
//   return res.json({company: results.rows[0]});
// });

module.exports = router;