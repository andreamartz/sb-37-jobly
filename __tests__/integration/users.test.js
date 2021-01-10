/** Integration tests for users routes */

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

afterAllHook(async () => {
  await afterAllHook();
});

describe("POST /register", function () {
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