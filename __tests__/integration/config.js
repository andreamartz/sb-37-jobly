// npm packages
const request = require('supertest');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');

// app imports
const app = require('../../app');
const db = require('../../db');
const { DB_URI } = require("../../config");

process.env.NODE_ENV = "test"

// global auth variable to store things for all the tests
const TEST_DATA = {};


/**
 * Hooks to insert a user, company, and job, and to authenticate
 *  the user and the company for respective tokens that are stored
 *  in the input `testData` parameter.
 * @param {Object} TEST_DATA - build the TEST_DATA object
 */
async function beforeEachHook(TEST_DATA) {
  try {
    // login a user, get a token, store the user ID and token
    // const hashedPassword = await bcrypt.hash('secret', 1);
    // await db.query(
    //   `INSERT INTO users (username, password, first_name, last_name, email, is_admin)
    //               VALUES ('test', $1, 'tester', 'mctest', 'test@rithmschool.com', true)`,
    //   [hashedPassword]
    // );

    // const response = await request(app)
    //   .post('/login')
    //   .send({
    //     username: 'test',
    //     password: 'secret'
    //   });

    // TEST_DATA.userToken = response.body.token;
    // TEST_DATA.currentUsername = jwt.decode(TEST_DATA.userToken).username;

    // do the same for company "companies"
    const newCompany = await db.query(`
      INSERT INTO 
        companies (handle, name, num_employees, description, logo_url) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,
      ['TGT', 'Target', 20000, 'Lower-tier retail department store', 'https://placekitten.com/200/300']
    );
    TEST_DATA.currentCompany = newCompany.rows[0];

    const newJob = await db.query(`
      INSERT INTO 
        jobs (title, salary, equity, company_handle) 
        VALUES ('QA Analyst', 60000, 0.001, $1) 
        RETURNING id, title, salary, equity, company_handle, date_posted`,
        [TEST_DATA.currentCompany.handle]
    );
    TEST_DATA.jobId = newJob.rows[0].id;
  } catch (error) {
    console.error(error);
  }
}

async function afterEachHook() {
  try {
    await db.query('DELETE FROM companies');
    await db.query('DELETE FROM jobs');
  } catch (error) {
    console.error(error);
  }
}

async function afterAllHook() {
  try {
    await db.end();
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  beforeEachHook,
  TEST_DATA,
  afterEachHook,
  afterAllHook
};
