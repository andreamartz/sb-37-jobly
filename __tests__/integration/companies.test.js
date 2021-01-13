/** Integration tests for companies routes */

const request =  require("supertest");
const app = require("../../app");
const db = require("../../db");
// const { DB_URI } = require("../../config");

process.env.NODE_ENV = "test"

// // handle of sample company
// let comp_handle;

const {
  TEST_DATA,
  // beforeAllHook,
  beforeEachHook,
  afterEachHook,
  afterAllHook
} = require("./config");

// beforeAll(async () => {
//   await beforeAllHook();
// });

beforeEach(async () => {
  await beforeEachHook(TEST_DATA);
});

afterEach(async () => {
  await afterEachHook();
});

afterAllHook(async () => {
  await afterAllHook();
});

/** 
 * Test GET /companies route
 */
describe("GET /companies", () => {
  test("Gets all companies", async () => {
    const res = await request(app)
      .get(`/companies`)
      .send({
        _token: TEST_DATA.notAdminToken
      })
    ;
    const companies = res.body.companies;
    expect(res.statusCode).toEqual(200);
    expect(companies).toBeInstanceOf(Array);
    expect(companies).toHaveLength(1);
    expect(companies[0]).toHaveProperty("handle");
  });

  test("Gets info for company with name similar to search term", async () => {
    const res = await request(app)
      .get(`/companies?search=targe`)
      .send({
        _token: TEST_DATA.notAdminToken
      })
    ;
    const companies = res.body.companies;
    expect(res.statusCode).toEqual(200);
    expect(companies[0].name).toEqual('Target');
  });

  test("Gets info for company when min_employees is less than max_employees", async () => {
    const res = await request(app)
      .get(`/companies?min_employees=10000&max_employees=25000`)
      .send({
        _token: TEST_DATA.notAdminToken
      })
    ;
    const companies = res.body.companies;
    expect(res.statusCode).toEqual(200);
    expect(companies[0].name).toEqual('Target');
  });

  test("Throws error when min_employees is greater than max_employees", async () => {
    const res = await request(app)
      .get(`/companies?min_employees=25000&max_employees=10000`)
      .send({
        _token: TEST_DATA.notAdminToken
      })
    ;
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual(400);
    expect(res.body.message).toEqual("Max employees must be greater than min employees");
  });

  test("Throws error when max_employees is specified twice", async () => {
    const res = await request(app)
      .get(`/companies?max_employees=10000&max_employees=25000`)
      .send({
        _token: TEST_DATA.notAdminToken
      })
    ;
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual(400);
    expect(res.body.message).toEqual("Cannot have duplicate parameters");
  });
});

/** 
 * Test GET /companies/:handle route
 */
describe("GET /companies/:handle", () => {
  test("Gets a single company matching on 'handle'", async () => {
    const res = await request(app)
      .get(`/companies/${TEST_DATA.currentCompany.handle}`)
      .send({
        _token: TEST_DATA.notAdminToken
      })
    ;
    const company = res.body.company;
    expect(res.statusCode).toEqual(200);
    expect(company.handle).toEqual("TGT");
  });

  test("Responds with 404 error when no match found for 'handle'", async () => {
    const res = await request(app)
      .get(`/companies/fds`)
      .send({
        _token: TEST_DATA.notAdminToken
      })
    ;
    expect(res.statusCode).toEqual(404);
  });
});

/** 
 * Test POST /companies route
 */
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
        },
        _token: TEST_DATA.adminToken
      })
    ;
    expect(res.statusCode).toEqual(201);
    expect(res.body.company).toHaveProperty("handle");
    expect(res.body.company.name).toEqual("Amazon");
  });
  
  test("Prevents creating a company with duplicate handle", async () => {
    const res = await request(app)
      .post(`/companies`)
      .send({
        company: {
          handle: 'TGT',
          name: "xxxxxx",
          num_employees: 20000,
          description: 'Large retailer',
          logo_url: 'http://target.com'
        },
        _token: TEST_DATA.adminToken
      })
    ;
  });

  test("Throws an error when company handle missing", async () => {
    const res = await request(app)
      .post(`/companies`)
      .send({
        company: {
          name: "Amazon",
          num_employees: 50000,
          description: 'Mega online retailer',
          logo_url: 'http://amazon.com'
        },
        _token: TEST_DATA.adminToken
      })
    ;
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual(["instance.company requires property \"handle\""]);
  });
});

/** 
 * Test PATCH /companies/:handle route
 */
describe("PATCH /companies/:handle", () => {
  test("Updates a company's number of employees", async () => {
    const res = await request(app)
      .patch(`/companies/TGT`)
      .send({ 
        company: {
          num_employees: 19000
        },
        _token: TEST_DATA.adminToken
      })
    ;
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
    const getCompRes = await request(app)
      .get(`/companies/tgt`)
      .send({
        _token: TEST_DATA.adminToken
      })
    ;
    expect(getCompRes.body.company.num_employees).toEqual(19000);
  });

  test("Responds with 404 error when no match found for 'handle'", async () => {
    const res = await request(app)
      .patch(`/companies/AMZN`)
      .send({ 
        company: {
          handle: 'AMZN',
          num_employees: 55000
        },
        _token: TEST_DATA.adminToken
      })
    ;
    expect(res.statusCode).toEqual(404);
  });

  test("Prevents adding unwanted field to company", async () => {
    const res = await request(app)
      .patch(`/companies/TGT`)
      .send({ 
        company: {
          handle: 'TGT',
          num_employees: 19000,
          cat: 'Goldie'
        },
        _token: TEST_DATA.adminToken
      })
    ;
    expect(res.statusCode).toEqual(400);
  })
});

/** 
 * Test DELETE /companies/:handle route
 */
describe("DELETE /companies/:handle", () => {
  test("Deletes a company", async () => {
    const res = await request(app)
      .delete(`/companies/TGT`)
      .send({
        _token: TEST_DATA.adminToken
      })
    ;
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      { message:  'Company deleted' }
    );
  });

  test('Responds with a 404 if company handle not found', async function() {
    // delete company first
    await request(app)
      .delete(`/companies/${TEST_DATA.currentCompany}`)
      .send({
        _token: TEST_DATA.adminToken
      })
    ;
    const res = await request(app)
      .delete(`/companies/${TEST_DATA.currentCompany}`)
      .send({
        _token: TEST_DATA.adminToken
      })
    ;
    expect(res.statusCode).toBe(404);
  });
});