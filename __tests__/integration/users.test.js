/** Integration tests for users routes */

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

afterEach(async () => {
  await afterEachHook();
});

afterAllHook(async () => {
  await afterAllHook();
});

// describe("GET /users", () => {
//   test("Gets all users", async () => {
//     const res = await request(app).get(`/users`);
//     console.log("RES.BODY: ", res.body);
//     const users = res.body.users;
//     console.log("USERS: ", users);
//     expect(res.statusCode).toEqual(200);
//     expect(users).toBeInstanceOf(Array);
//   });
// https://www.codegrepper.com/code-examples/javascript/jest+test+array+of+objects
// })