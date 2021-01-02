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
      'TGT',
      'Target',
      '20000',
      'Lower-tier retail department store',
      'https://placekitten.com/200/300'),
      ('KNAPP',
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
    const companies = res.body.companies;
    expect(res.statusCode).toEqual(200);
    expect(companies).toBeInstanceOf(Array);
    expect(companies).toHaveLength(2);
    expect(companies[0]).toHaveProperty("handle");
  });
});

describe("GET /companies?search=targe", () => {
  test("Gets info for company (Target) with name similar to 'targe'", async () => {
    const res = await request(app).get(`/companies?search=targe`);
    const companies = res.body.companies;
    expect(res.statusCode).toEqual(200);
    expect(companies[0].name).toEqual('Target');
  });
});

describe("GET /companies specifying valid range of number of employees", () => {
  test("Gets info for company when min_employees is less than max_employees", async () => {
    const res = await request(app).get(`/companies?min_employees=10000&max_employees=25000`);
    const companies = res.body.companies;
    expect(res.statusCode).toEqual(200);
    expect(companies[0].name).toEqual('Target');
  });
});

describe("GET /companies specifying invalid range of number of employees", () => {
  test("Throws error when min_employees is greater than max_employees", async () => {
    const res = await request(app).get(`/companies?min_employees=25000&max_employees=10000`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual(400);
    expect(res.body.message).toEqual("Max employees must be greater than min employees");
  });
});

describe("GET /companies specifying duplicate parameter", () => {
  test("Throws error when max_employees specified twice", async () => {
    const res = await request(app).get(`/companies?max_employees=10000&max_employees=25000`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual(400);
    expect(res.body.message).toEqual("Cannot have duplicate parameters");
  });
});

describe("POST /companies", () => {
  test("Creates a new company", async () => {
    const res = await request(app)
      .post(`/companies`)
      .send({
        company: {
          handle: 'AMZN',
          name: "Amazon",
          num_employees: 50000,
          description: 'Mega online retailer',
          logo_url: 'http://amazon.com'
        }
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.company).toHaveProperty("handle");
    expect(res.body.company.name).toEqual("Amazon");
  });
});

describe("POST /companies", () => {
  test("Throws an error when company handle missing", async () => {
    const res = await request(app)
      .post(`/companies`)
      .send({
        company: {
          name: "Amazon",
          num_employees: 50000,
          description: 'Mega online retailer',
          logo_url: 'http://amazon.com'
        }
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual(["instance.company requires property \"handle\""]);
  });
});

describe("GET /companies/:handle", () => {
  test("Gets a single company matching on 'handle'", async () => {
    const res = await request(app).get(`/companies/${comp_handle}`);
    const company = res.body.company;
    expect(res.statusCode).toEqual(200);
    expect(company.handle).toEqual("TGT");
  });
});

describe("GET /companies/:handle (invalid handle)", () => {
  test("Throws 404 error when no match found for 'handle'", async () => {
    const res = await request(app).get(`/companies/fds`);
    expect(res.statusCode).toEqual(404);
  });
});

describe("PATCH /companies/:handle", () => {
  test("Updates a company with data provided", async () => {
    const res = await request(app)
      .patch(`/companies/TGT`)
      .send({ 
        company: {
          handle: 'TGT',
          num_employees: 19000
        }
      });
    // console.log("RES: ", res);
    // console.log("RES.BODY: ", res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      { company: 
        { handle: 'TGT',
          name: 'Target',
          description: 'Lower-tier retail department store',
          logo_url: 'https://placekitten.com/200/300', 
          num_employees: 19000
        }
      }
    );
    const getCompRes = await request(app).get(`/companies/tgt`);
    console.log("getCompRes: ", getCompRes);
    expect(getCompRes.body.company.num_employees).toEqual(19000);
  });
});