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

  static async findAll() {
    
  }
  static async findOne(id) {

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