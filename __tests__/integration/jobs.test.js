/** Integration tests for jobs routes */

const request =  require("supertest");
const app = require("../../app");

const {
  TEST_DATA,
  afterEachHook,
  beforeEachHook,
  afterAllHook
} = require("./config");

beforeEach(async () => {
  await beforeEachHook(TEST_DATA);
});

describe("GET /jobs", () => {
  test("Gets info for a job", async () => {
    const res = await request(app).get(`/jobs`);
    const jobs = res.body.jobs;
    expect(res.statusCode).toEqual(200);
    expect(jobs[0].title).toEqual('QA Analyst');
  });
  test("Gets info for job when min_salary is specified", async () => {
    const res = await request(app).get(`/jobs?min_salary=50000`);
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
            company_handle: TEST_DATA.currentCompany.handle
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
            company_handle: TEST_DATA.currentCompany.handle,
            giraffe: "tall"
          }
        }
      )
    expect(res.statusCode).toEqual(400);
  });
});

afterEach(async () => {
  await afterEachHook();
});

afterAll(async () => {
  await afterAllHook();
});