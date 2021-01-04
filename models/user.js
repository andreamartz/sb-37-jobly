const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const bcrypt = require("bcrypt");

const BCRYPT_WORK_FACTOR = 12;

/** Collection of related methods for users */

class User {
  /** given a username, return user data with that username:
   * 
   * => {username, first_name, last_name, email, photo_url, is_admin}
   * 
   **/

  static async register(data) {
    // verify that the username has not already been taken, and throw an error if it has been - use the User.findOne() method
    const dupeCheck = await db.query(
      `SELECT username 
        FROM users 
        WHERE username = $1`,
      [data.username]
    );

    if (dupeCheck.rows[0]) {
      throw new ExpressError(
        `The username '${data.username}' is taken; please choose another.`, 400
      );
    }

    // encrypt the password for storage in database
    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);

    // SQL to do the INSERT goes here (be sure to prevent SQL injection)
    const results = await db.query(
      `INSERT INTO users (
              username, 
              password,
              first_name, 
              last_name, 
              email, 
              photo_url, 
              is_admin 
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING username,
                first_name,
                last_name,
                email,
                photo_url,
                is_admin`,
      [ 
        data.username,
        hashedPassword,
        data.first_name,
        data.last_name,
        data.email,
        data.photo_url,
        data.is_admin
      ]
    );

    return results.rows[0];
  }

module.exports = User;