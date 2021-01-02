const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate")

/** Collection of related methods for companies */

class Company {
  /** given a company handle, return company data with that handle:
   * 
   * => {handle, name, num_employees, description, logo_url}
   * 
   **/

  static async findAll(data) {
    const BASE_QUERY = 'SELECT handle, name FROM companies';
    const whereClauses = [];
    let whereString = "";
    const queryParameters = [];
    let query;

    // ***** build whereClauses and queryParameters *****
    // if there is a search query parameter
    if (data.search) {
      queryParameters.push(`%${data.search}%`);
      whereClauses.push(`LOWER(name) LIKE $${queryParameters.length}`);
    } 

    if (data.min_employees > data.max_employees) {
      throw new ExpressError("Max employees must be greater than min employees", 400);
    }

    if (typeof data.search === "object" || typeof data.min_employees === "object" || typeof data.max_employees === "object") {
      throw new ExpressError("Cannot have duplicate parameters", 400);
    }

    // if there is a min_employees query parameter
    if (data.min_employees) {
      queryParameters.push(+data.min_employees);
      whereClauses.push(`num_employees > $${queryParameters.length}`)
    }

    // if there is a max_employees query parameter   
    if (data.max_employees) {
      queryParameters.push(+data.max_employees);
      whereClauses.push(`num_employees < $${queryParameters.length}`)
    }

    // ***** Build Query *****
    if (whereClauses.length > 0) {
      whereString = " WHERE ";
    }

    whereString = whereString + whereClauses.join(" AND ");
    query = BASE_QUERY + whereString;
    // }

    const results = await db.query(query, queryParameters);

    return results.rows;
  }

  static async findOne(handle) {
    handle = handle.toUpperCase();
    const results = await db.query(
      `SELECT 
        handle, 
        name, 
        num_employees, 
        description, 
        logo_url
      FROM companies
      WHERE UPPER(handle)=$1`, 
      [handle]
    );

    if (results.rows.length === 0) {
      throw { message: `There is no company with a handle '${handle}`, status: 404 }
    }
    return results.rows[0];
  }

  static async create(data) {
    const results = await db.query(
      `INSERT INTO companies (
        handle,
        name, 
        num_employees, 
        description,
        logo_url
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING handle,
                name,
                num_employees,
                description,
                logo_url`,
      [ data.handle,
        data.name,
        data.num_employees,
        data.description,
        data.logo_url
      ]
    );

    return results.rows[0];
  }
  
  static async update(handle, data) {
    const { query, values } = sqlForPartialUpdate('companies', data, 'handle', handle);
    const results = await db.query(
      query, values);
    if (results.rows.length === 0) {
      throw new ExpressError('No such company was found', 404);
    }
    return results.rows[0];
  }

  static async remove(handle) {
    const result = await db.query(
      `DELETE FROM companies 
      WHERE handle = $1
      RETURNING 
        handle`,
      [handle]
    );
    if (result.rows.length === 0) {
      throw new Express
    }     
  }
}


module.exports = Company;