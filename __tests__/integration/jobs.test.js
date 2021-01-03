/** Integration tests for jobs routes */

const request =  require("supertest");
const app = require("../../app");
const db = require("../../db");
const { DB_URI } = require("../../config");

process.env.NODE_ENV = "test"

// handle of sample job
let comp_handle;
let job_id;

beforeEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM jobs`);

  // set up a company
  let company = await db.query(`
  INSERT INTO
    companies (handle, name, num_employees, description, logo_url)
    VALUES (
      'TGT',
      'Target',
      '20000',
      'Lower-tier retail department store',
      'https://placekitten.com/200/300')
    RETURNING handle, name, num_employees,
    description, logo_url`
  );
  comp_handle = company.rows[0].handle;
  
  // set up a job at that company
  let job = await db.query(`
  INSERT INTO
    jobs (title, salary, equity, company_handle)
    VALUES (
      'QA Analyst',
      35000,
      0.001,
      'TGT')
    RETURNING id, title, salary, equity, company_handle, date_posted`
  );
  job_id = job.rows[0].id;
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM jobs`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /jobs", () => {
  test("Gets info for a job", async () => {
    const res = await request(app).get(`/jobs`);
    const jobs = res.body.jobs;
    expect(res.statusCode).toEqual(200);
    expect(jobs[0].title).toEqual('QA Analyst');
  });
  test("Gets info for job when min_salary is specified", async () => {
    const res = await request(app).get(`/jobs?min_salary=30000`);
    const jobs = res.body.jobs;
    expect(res.statusCode).toEqual(200);
    expect(jobs[0].title).toEqual('QA Analyst');
  });
  test("Gets info for job when min_equity is specified", async () => {
    const res = await request(app).get(`/jobs?min_equity=0.0001`);
    const jobs = res.body.jobs;
    expect(res.statusCode).toEqual(200);
    expect(jobs[0].title).toEqual('QA Analyst');
  });
});

describe("POST /jobs", () => {
  test("Creates a new job", async () => {
    const resNewJob = await request(app)
      .post(`/jobs`)
      .send(
        {
          job: {
            title: 'QA Analyst',
            salary: 35000,
            equity: 0.002,
            company_handle: comp_handle
          }
        }
      );
    expect(resNewJob.statusCode).toEqual(201);
    expect(resNewJob.body.job).toHaveProperty("id");
    expect(resNewJob.body.job.title).toEqual("QA Analyst");
    const resJobs = await request(app).get(`/jobs`);
    expect(resJobs.body.jobs).toHaveLength(2);
  });
  
  test("Prevents creating a job with extra fields", async () => {
    const res = await request(app)
      .post(`/jobs`)
      .send(
        {
          job: {
            title: `Job Title`,
            salary: 40000,
            company_handle: comp_handle,
            giraffe: "tall"
          }
        }
      )
    expect(res.statusCode).toEqual(400);
  });
});