const db = require("../db");
// const ExpressError = require("../helpers/expressError");
// const sqlForPartialUpdate = require("../helpers/partialUpdate");


/** Collection of related methods for jobs */

class Job {
  /** given a job id, return job data for that id:
   * 
   * => {id, title, salary, equity, company_handle, date_posted}
   * 
   **/

  static async findAll(data) {
    const BASE_QUERY = 'SELECT title, company_handle FROM jobs';
    const whereClauses = [];
    let whereString = "";
    const queryParameters = [];
    let query;

    // ***** build whereClauses and queryParameters *****
    // if there is a search query parameter
    if (data.search) {
      queryParameters.push(`%${data.search}%`);
      whereClauses.push(`LOWER(title) ILIKE $${queryParameters.length}`);
    } 

    if (typeof data.search === "object" || typeof data.min_salary === "object" || typeof data.min_equity === "object") {
      throw new ExpressError("Cannot have duplicate parameters", 400);
    }

    // if there is a min_salary query parameter
    if (data.min_salary) {
      queryParameters.push(+data.min_salary);
      whereClauses.push(`salary > $${queryParameters.length}`);
    }
    console.log("WHERECLAUSES: ", whereClauses);
    console.log("QUERYPARAMETERS: ", queryParameters);

    // if there is a min_equity query parameter   
    if (data.min_equity) {
      queryParameters.push(+data.min_equity);
      whereClauses.push(`equity > $${queryParameters.length}`)
    }

    // ***** Build Query *****
    if (whereClauses.length > 0) {
      whereString = " WHERE ";
    }

    whereString = whereString + whereClauses.join(" AND ");
    query = BASE_QUERY + whereString + ' ORDER BY date_posted';
    // }
    console.log("WHERESTRING: ", whereString);
    console.log("QUERY: ", query);

    const results = await db.query(query, queryParameters);

    return results.rows;
  }

  static async findOne(id) {
    id = +id;
    const jobRes = await db.query(`
      SELECT id, title, salary, equity, company_handle, date_posted 
      FROM jobs
      WHERE id = $1`,
      [ id ]
    );
    const job = jobRes.rows[0];
    if (!job) {
      throw new ExpressError(`No job found with id '${id}'`, 404);
    }

    const compRes = await db.query(`
      SELECT handle, name, num_employees, description, logo_url
      FROM companies
      WHERE handle = $1`,
      [ job.company_handle ]
    );
    const company = compRes.rows[0];
    job.company = company;
    console.log("JOB FROM DB: ", job);
    return job;
  }

  static async create(data) {
    const results = await db.query(
      `INSERT INTO jobs (
        title,
        salary,
        equity,
        company_handle
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id,
                title,
                salary,
                equity,
                company_handle,
                date_posted`,
      [
        data.title,
        data.salary,
        data.equity,
        data.company_handle
      ]
    );
    return results.rows[0];
  }

  module.exports = Job;