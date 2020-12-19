/** Integration tests for books route */

const request =  require("supertest");
const app = require("../../app");
const db = require("../../db");
const { DB_URI } = require("../../config");

process.env.NODE_ENV = "test"

// handle of sample company
let comp_handle;

beforeEach(async () => {
  // 
  await db.query(`DROP TABLE IF EXISTS companies`);
  await db.query(`
    CREATE TABLE companies (
      handle TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      num_employees INTEGER,
      description TEXT,
      logo_url TEXT
    )
  `);
  let result = await db.query(`
  INSERT INTO
    companies (handle, name, num_employees, description, logo_url)
    VALUES (
      'target',
      'Target',
      '20000',
      'Lower-tier retail department store',
      'https://placekitten.com/200/300'),
      ('knapp',
      'Knapp & Associates',
      '0',
      'Management consulting',
      'https://placekitten.com/200/300'
      )
    RETURNING handle, name, num_employees,
    description, logo_url`
  );
  comp_handle = result.rows[0].handle;
});

afterEach(async () => {
  // await db.query("DELETE FROM companies");
  await db.query(`DROP TABLE IF EXISTS companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Gets all companies", async () => {
    const res = await request(app).get(`/companies`);
    console.log("res.body: ", res.body);
    const companies = res.body.companies;
    expect(res.statusCode).toEqual(200);
    expect(companies).toBeInstanceOf(Array);
    expect(companies).toHaveLength(2);
    expect(companies[0]).toHaveProperty("handle");
  });
});
