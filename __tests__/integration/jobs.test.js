/** Integration tests for jobs routes */

const request =  require("supertest");
const app = require("../../app");

const {
  TEST_DATA,
  beforeEachHook,
  afterEachHook,
  afterAllHook
} = require("./config");

beforeEach(async () => {
  await beforeEachHook(TEST_DATA);
});

afterEach(async () => {
  await afterEachHook();
});

afterAll(async () => {
  await afterAllHook();
});

/** 
 * Test Get /jobs route
 */
describe("GET /jobs", () => {
  test("Gets a list of all jobs", async () => {
    const res = await request(app)
      .get(`/jobs`)
      .send({ _token: TEST_DATA.notAdminToken });
    const jobs = res.body.jobs;
    expect(res.statusCode).toEqual(200);
    expect(jobs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "QA Analyst"})
      ])
    );
    expect(jobs).toHaveLength(1);
  });

  test("Gets info for job when min_salary is specified", async () => {
    const res = await request(app)
      .get(`/jobs?min_salary=50000`)
      .send({ _token: TEST_DATA.notAdminToken });
    const jobs = res.body.jobs;
    expect(res.statusCode).toEqual(200);
    expect(jobs[0].title).toEqual('QA Analyst');
  });

  test("Gets info for job when min_equity is specified", async () => {
    const res = await request(app)
      .get(`/jobs?min_equity=0.0001`)
      .send({ _token: TEST_DATA.notAdminToken });
    const jobs = res.body.jobs;
    expect(res.statusCode).toEqual(200);
    expect(jobs[0].title).toEqual('QA Analyst');
  });

  test("Prevents getting jobs info while not logged in", async () => {
    const res = await request(app)
      .get(`/jobs`);
    const jobs = res.body.jobs;
    expect(res.statusCode).toEqual(401);
  });
});

/** 
 * Test Get /jobs/:id route
 */
describe("GET /jobs/:id", () => {
  test("Gets a job by id", async () => {
    const res = await request(app)
      .get(`/jobs/${TEST_DATA.jobId}`)
      .send({ _token: TEST_DATA.notAdminToken })
    ;
    const job = res.body.job;
    expect(res.statusCode).toEqual(200);
    expect(job.id).toEqual(TEST_DATA.jobId);
    expect(job.company.handle).toEqual(TEST_DATA.currentCompany.handle);
  });

  test("Prevents getting a job's details while not logged in", async () => {
    const res = await request(app)
      .get(`/jobs/${TEST_DATA.jobId}`)
    ;
    const job = res.body.job;
    expect(res.statusCode).toEqual(401);
  });
});

/** 
 * Test POST /jobs route
 */
describe("POST /jobs", () => {
  test("Creates a new job", async () => {
    const data = {
      job: {
        title: 'QA Analyst',
        salary: 35000,
        equity: 0.002,
        company_handle: TEST_DATA.currentCompany.handle
      },
      _token: TEST_DATA.adminToken
    };
    const resNewJob = await request(app)
      .post(`/jobs`)
      .send(data)
    ;
    expect(resNewJob.statusCode).toEqual(201);
    expect(resNewJob.body.job).toHaveProperty("id");
    expect(resNewJob.body.job.title).toEqual("QA Analyst");
    const resJobs = await request(app)
      .get(`/jobs`)
      .send({ _token: TEST_DATA.notAdminToken })
    ;
    expect(resJobs.body.jobs).toHaveLength(2);
  });

  test("Prevents creating a job by a user without admin rights", async () => {
    const data = {
      job: {
        title: 'QA Analyst',
        salary: 35000,
        equity: 0.002,
        company_handle: TEST_DATA.currentCompany.handle
      },
      _token: TEST_DATA.notAdminToken
    };
    const resNewJob = await request(app)
      .post(`/jobs`)
      .send(data)
    ;
    expect(resNewJob.statusCode).toEqual(401);
  });

  test("Prevents creating a job with missing reqired title field", async () => {
    const data = {
      job: {
        salary: 40000,
        company_handle: TEST_DATA.currentCompany.handle,
      },
      _token: TEST_DATA.adminToken
    }
    const res = await request(app)
      .post(`/jobs`)
      .send(data)
    ;
    expect(res.statusCode).toEqual(400);
  });

  test("Prevents creating a job with extra fields", async () => {
    const data = {
      job: {
        title: `Job Title`,
        salary: 40000,
        company_handle: TEST_DATA.currentCompany.handle,
        giraffe: "tall"
      },
      _token: TEST_DATA.adminToken
    }
    const res = await request(app)
      .post(`/jobs`)
      .send(data)
    ;
    expect(res.statusCode).toEqual(400);
  });
});

/** 
 * Test PATCH /jobs route
 */
describe("PATCH /jobs/:id", function () {
  test("Updates a job's salary", async function () {
    const data = {
      job: {
        salary: 100000
      },
      _token: TEST_DATA.adminToken
    };
    const res = await request(app)
      .patch(`/jobs/${TEST_DATA.jobId}`)
      .send(data)
    ;
    expect(res.statusCode).toEqual(200);
    expect(res.body.job.salary).toBe(100000);
    expect(res.body.job.id).toEqual(TEST_DATA.jobId);
  });

  test("Prevents a user from adding a new property to a job", async function () {
    const data = {
      job: {
        salary: 100000,
        giraffe: "tall"
      },
      _token: TEST_DATA.adminToken
    };
    const res = await request(app)
      .patch(`/jobs/${TEST_DATA.jobId}`)
      .send(data)
    ;
    expect(res.statusCode).toBe(400);
  });

  test("Responds with a 404 if it cannot find the job", async function () {
    const data = {
      job: {
        salary: 100000,
        giraffe: "tall"
      },
      _token: TEST_DATA.adminToken
    }
    // delete job first
    await request(app)
      .delete(`/jobs/${TEST_DATA.jobId}`)
      .send({ _token: TEST_DATA.adminToken })
    ;
    // try to update the deleted job
    const res = await request(app)
      .patch(`/jobs/${TEST_DATA.jobId}`)
      .send(data)
    ;
    expect(res.statusCode).toBe(404);
  });
});

 /** 
 * Test DELETE /jobs route
 */
describe("DELETE /jobs/:id", function () {
  test("Deletes a job", async function () {
    const res = await request(app)
        .delete(`/jobs/${TEST_DATA.jobId}`).send({_token: TEST_DATA.adminToken})
    expect(res.body).toEqual({ message: "Job deleted" });
  });

  test("Responds with a 404 if it cannot find the job", async function () {
    // delete job first
    await request(app)
      .delete(`/jobs/${TEST_DATA.jobId}`)
      .send({ _token: TEST_DATA.adminToken})
    ;
    const res = await request(app)
      .delete(`/jobs/${TEST_DATA.jobId}`)
      .send({ _token: `${TEST_DATA.adminToken}` })
    ;
    expect(res.statusCode).toBe(404);
  });
});