const db = require("../db");

/** Collection of related methods for companies */

class Company {
  /** given a company handle, return company data with that handle:
   * 
   * +> {handle, name, num_employees, description, logo_url}
   * 
   **/

  static async findAll(data) {
    // if data is an empty object, then find all companies
    if (Object.keys(data).length === 0) {
      const results = await db.query(
        `SELECT 
          handle, 
          name
        FROM companies`
      );
      console.log("results.rows: ", results.rows);
      return results.rows;
    }
    // if data is not empty, 
    console.log("data: ", data);

    const results = await db.query(
      `SELECT
        handle,
        name
      FROM companies
      WHERE LOWER(name) = $1`,
      [data.search]
    );
    console.log("results.rows: ", results.rows);
    return results.rows;
  }

  // static async findOne(handle) {
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
  //     throw { message: `There is no company with an handle '${handle}`, status: 404 }
  //   }
  //   console.log("results: ", results);
  //   console.log("results.rows[0]: ", results.rows[0]);
  //   return results.rows[0];
  // }
}


module.exports = Company;