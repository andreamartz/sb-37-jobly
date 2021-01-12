/** Integration tests for users routes */

const request =  require("supertest");
const app = require("../../app");

const {
  TEST_DATA,
  beforeAllHook,
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
 * Test /auth/register route
 */
describe("POST /auth/register", function () {
  test("Registers a new user", async function () {
    const user = { 
      user: 
      { username: "testuser",
        password: "testpw",
        first_name: "Test",
        last_name: "User",
        email: "test@user.com",
        photo_url: "https://placekitten.com/250/350",
        is_admin: "false" 
      }
    };
    const response = await request(app)
      .post('/auth/register')
      .send(user)
    ;
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ token: expect.any(String) });
  });

  test("Prevents registering a user when an extra property on the request body", async function() {
    const user = { 
      user: 
      { username: "testuser-admin",
        password: "testpw",
        first_name: "Test",
        last_name: "User",
        email: "test@user.com",
        photo_url: "https://placekitten.com/250/350",
        is_admin: "false",
        cat: "Goldie Mae"
      }
    };
    const response = await request(app)
      .post("/auth/register")
      .send(user)
    ;
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      "status": 400,
      "message": [
        "instance.user is not allowed to have the additional property \"cat\""
      ]
    });
  });

  test("Prevents registration/creation of a user with duplicate username", async function() {
    const user = { 
      user: 
      { username: "testuser-admin",
        password: "testpw",
        first_name: "Test",
        last_name: "User",
        email: "test@user.com",
        photo_url: "https://placekitten.com/250/350",
        is_admin: "false" 
      }
    };
    const response = await request(app)
      .post("/auth/register")
      .send(user)
    ;
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      "status": 400,
      "message": `The username '${user.user.username}' is taken; please choose another.`
    });
  });

  test("Prevents registration/creation of a user if no password is provided", async function () {
    const user = { 
      user: 
        { username: "testuser",
          first_name: "Test",
          last_name: "User",
          email: "test@user.com",
          photo_url: "https://placekitten.com/250/350",
          is_admin: "false" 
        }
    };
    const response = await request(app)
      .post('/auth/register')
      .send(user);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual(
      { 
        "message": ["instance.user requires property \"password\""], "status": 400 
      }
    );
  });
});

// /** 
//  * Test /auth/login route
//  */
describe("POST /auth/login", function () {
  test("Logs in a user", async function () {
    const user = { 
      user: 
      { 
        username: "testuser-not-admin",
        password: "secret"
      }
    };
    const response = await request(app)
      .post('/auth/login')
      .send(user)
    ;
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(expect.objectContaining({ token: expect.any(String) }));
  });

  test("Login fails with wrong password", async function () {
    const user = {
      user:
      {
        username: "testuser-not-admin",
        password: "Wrong-password"
      }
    };
    const response = await request(app)
      .post(`/auth/login`)
      .send(user)
    ;
    expect(response.statusCode).toBe(400);
  });
});

/** 
 * Test GET /users route
 */
describe("GET /users", () => {
  test("Gets all users", async () => {
    const res = await request(app).get(`/users`);
    const users = res.body.users;
    expect(res.statusCode).toEqual(200);
    expect(users).toBeInstanceOf(Array);
    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: "testuser-not-admin" }),
        expect.objectContaining({ username: "testuser-admin" })
      ])
    );
  });
});

/** 
 * Test GET /users/:username route
 */
describe("GET /users/:username", () => {
  test("Gets a single user's details", async () => {
    const res = await request(app)
      .get(`/users/testuser-not-admin`)
    ;
    const user = res.body.user;
    expect(res.statusCode).toEqual(200);
    expect(user).toEqual(
      expect.objectContaining({ username: "testuser-not-admin" })
    );
  });

  test("404 if user cannot be found", async function() {
    const res = await request(app)
      .get(`/users/wronguser`)
    ;
    expect(res.statusCode).toBe(404);
  });
});

/** 
 * Test PATCH /users/:username route
 */
describe("PATCH /users/:username", () => {
  test("Updates a user's email address", async () => {
    const data = { 
      user: 
        { email: "newEmail@test.com" },
      _token: TEST_DATA.notAdminToken
      }
    ;
    const res = await request(app)
      .patch(`/users/${TEST_DATA.notAdminUsername}`)
      .send(data)
    ;
    const user = res.body.user;
    expect(res.statusCode).toEqual(200);
    expect(user).toHaveProperty("username");
    expect(user.email).toBe("newEmail@test.com");
  });

  test("Prohibits update of user's username", async () => {
    const data = { 
      user: 
        { username: "newUsername" },
      _token: TEST_DATA.notAdminToken
    };
    const res = await request(app)
      .patch(`/users/${TEST_DATA.notAdminUsername}`)
      .send(data)
    ;
    const user = res.body.user;
    expect(res.statusCode).toEqual(400);
  });

  test("Prohibits update of another user's email address", async () => {
    const data = { 
      user: 
        { email: "newemail@email.com" },
      _token: TEST_DATA.adminToken
    };
    const res = await request(app)
      .patch(`/users/${TEST_DATA.notAdminUsername}`)
      .send(data)
    ;
    const user = res.body.user;
    expect(res.statusCode).toEqual(401);
  });

  test("Prohibits a user from adding a new user property", async () => {
    const data = { 
      user: 
        { cat: "Millie" },
      _token: TEST_DATA.notAdminToken
    };
    const res = await request(app)
      .patch(`/users/${TEST_DATA.notAdminUsername}`)
      .send(data)
    ;
    const user = res.body.user;
    expect(res.statusCode).toEqual(400);
  });

  test("Responds with 404 error if the username in URL is not found", async () => {
    const data = { 
      user: 
        { email: "newemail@email.com" },
      _token: TEST_DATA.notAdminToken
    };
    // delete user first
    await request(app)
      .delete(`/users/${TEST_DATA.notAdminUsername}`)
      .send({ _token: `${TEST_DATA.notAdminToken}` });
    const res = await request(app)
      .patch(`/users/${TEST_DATA.notAdminUsername}`)
      .send(data)
    ;
    const user = res.body.user;
    expect(res.statusCode).toEqual(404);
  });
});

/** 
 * Test DELETE /users/:username route
 */
describe("DELETE /users/:username", () => {
  test("Deletes a user", async () => {
    const res = await request(app)
      .delete(`/users/${TEST_DATA.notAdminUsername}`)
      .send({ _token: `${TEST_DATA.notAdminToken}` })
    ;
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "User deleted" });
  });
  test("Prevents a user from deleting another user", async () => {
    const res = await request(app)
      .delete(`/users/${TEST_DATA.adminUsername}`)
      .send({ _token: `${TEST_DATA.notAdminToken}` })
    ;
    expect(res.statusCode).toBe(401);
  });
  test("Responds with a 404 error if the user cannot be found", async () => {
    const data = { 
      user: 
        { email: "newemail@email.com" },
      _token: TEST_DATA.notAdminToken
    };
    // delete user first
    await request(app)
      .delete(`/users/${TEST_DATA.notAdminUsername}`)
      .send({ _token: `${TEST_DATA.notAdminToken}` });
    const res = await request(app)
      .delete(`/users/${TEST_DATA.notAdminUsername}`)
      .send(data)
    ;
    const user = res.body.user;
    expect(res.statusCode).toEqual(404);
  });
});
