const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");

/** Collection of related methods for users */

class User {
  /** given a username, return user data with that username:
   * 
   * => {username, first_name, last_name, email, photo_url, is_admin}
   * 
   **/

  static async findAll() {
    const results = await db.query(`
    SELECT 
      username, 
      first_name, 
      last_name, 
      email
    FROM users`);

    return results.rows;
  }

  static async findOne(username) {
    const user = await db.query(
      `SELECT 
        username, 
        first_name, 
        last_name, 
        email, 
        photo_url, 
        is_admin 
      FROM users
      WHERE LOWER(username)=$1`, 
      [username]
    );
    console.log("USER: ", user);
    if (user.rows.length === 0) {
      throw new ExpressError(`There is no user with username '${username}'`, 404);
    }

    return user.rows[0];
  }

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
  
  static async update(username, data) {
    const { query, values } = sqlForPartialUpdate('users', data, 'username', username);
    const results = await db.query(
      query, values);
    if (results.rows.length === 0) {
      throw new ExpressError('No such user was found', 404);
    }
    delete results.rows[0].password;
    return results.rows[0];
  }

  static async remove(username) {
    username = username.toUpperCase();
    const result = await db.query(
      `DELETE FROM users 
      WHERE UPPER(username) = $1
      RETURNING 
        username`,
      [username]
    );
  
    if (result.rows.length === 0) {
      throw new ExpressError('No such user was found', 404);
    }
    return result.rows[0];
  }
}

module.exports = User;