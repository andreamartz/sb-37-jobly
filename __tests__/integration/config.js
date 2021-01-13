process.env.NODE_ENV = "test"

// npm package imports
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// app imports
const app = require('../../app');
const db = require('../../db');
const { DB_URI, BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../../config");

// global auth variable to store instance properties (of users, jobs, companies) for all the tests
const TEST_DATA = {};

/**
 * Hooks to insert a user, company, and job, and to authenticate the user and the company for respective tokens that are stored in the input `TEST_DATA` parameter.
 * 
 * @param {Object} TEST_DATA - build the TEST_DATA object
 */
async function beforeAllHook() {
  try {
    await db.connect();
  } catch (err) {
    console.error(err);
  }
}

async function beforeEachHook(TEST_DATA) {
  try {
    /**
     * login sample users, get a token for each, and store the user ID and token
    */ 

    const hashedPassword = await bcrypt.hash('secret', BCRYPT_WORK_FACTOR);

    // insert sample users into the test database
    await db.query(`
      INSERT INTO users (username, password, first_name, last_name, email, is_admin)
        VALUES ('testuser-not-admin', $1, 'FirstName1', 'LastName1', 'testuser1@gmail.com', false)`,
      [hashedPassword]
    );
    await db.query(`
      INSERT INTO users (username, password, first_name, last_name, email, is_admin)
        VALUES ('testuser-admin', $1, 'FirstName2', 'LastName2', 'testuser2@gmail.com', true)`,
      [hashedPassword]
    );

    // log in both sample users (one with and one without admin rights) and receive token for each
    const respNotAdmin = await request(app)
      .post('/auth/login')
      .send({ user:
        {
          username: 'testuser-not-admin',
          password: 'secret'
        }
      }
    );

    const respAdmin = await request(app)
      .post('/auth/login')
      .send({ user:
        {
          username: 'testuser-admin',
          password: 'secret'
        }
      }
    );
    
    // store usernames, tokens on TEST_DATA object
    TEST_DATA.notAdminToken = respNotAdmin.body.token;
    TEST_DATA.notAdminUsername = jwt.verify(TEST_DATA.notAdminToken, SECRET_KEY).username;

    TEST_DATA.adminToken = respAdmin.body.token;
    TEST_DATA.adminUsername = jwt.verify(TEST_DATA.adminToken, SECRET_KEY).username; 

    /**
     * insert a sample company into the database and store it in TEST_DATA
    */ 
    const newCompany = await db.query(`
      INSERT INTO 
        companies (handle, name, num_employees, description, logo_url) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,
      ['TGT', 'Target', 20000, 'Lower-tier retail department store', 'https://placekitten.com/200/300']
    );
    TEST_DATA.currentCompany = newCompany.rows[0];

    /**
     * insert a sample job into the database and store it in TEST_DATA
    */ 
    const currentJob = await db.query(`
      INSERT INTO 
        jobs (title, salary, equity, company_handle) 
        VALUES ('QA Analyst', 60000, 0.001, $1) 
        RETURNING id, title, salary, equity, company_handle, date_posted`,
        [TEST_DATA.currentCompany.handle]
    );
    TEST_DATA.jobId = currentJob.rows[0].id;
  } catch (error) {
    console.error(error);
  }
}

async function afterEachHook() {
  try {
    await db.query('DELETE FROM companies');
    await db.query('DELETE FROM jobs');
    await db.query('DELETE FROM users');
  } catch (error) {
    console.error(error);
  }
}

async function afterAllHook() {
  try {
    // await db.end();
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  beforeAllHook,
  beforeEachHook,
  TEST_DATA,
  afterEachHook,
  afterAllHook
};
