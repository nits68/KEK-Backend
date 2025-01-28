import "dotenv/config";

import request from "supertest";

import App from "../../app";
import AuthenticationController from "../authentication.controller";

let server: App;
let cookie: string | any;

beforeAll(async () => {
    // create server for test:
    server = new App([new AuthenticationController()]);
    // connect and get cookie for authentication
    await server
        .connectToTheDatabase("5001")
        .then(msg => {
            console.log(msg);
        })
        .catch(err => {
            console.log(err);
        });
    const res = await request(server.getServer()).post("/auth/login").send({
        email: "admin@jedlik.eu",
        password: "admin",
    });
    // set cookie
    cookie = res.headers["set-cookie"][0];
});

describe("test authentication endpoints", () => {
    it("POST /auth/register (email already exists)", async () => {
        const response = await request(server.getServer())
            .post("/auth/register")
            .send({
                name: "admin",
                email: "admin@jedlik.eu",
                auto_login: true,
                roles: ["admin"],
                password: "admin",
            });
        expect(response.statusCode).toEqual(400);
        expect(response.body.message).toEqual("User with email admin@jedlik.eu already exists");
        expect(response.body.status).toEqual(400);
    });

    it("GET /auth/resend/admin@jedlik.eu (already verified)", async () => {
        const response = await request(server.getServer()).get("/auth/resend/admin@jedlik.eu");
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual("This account has been already verified. Please log in.");
        expect(response.body.status).toEqual(200);
    });

    it("GET /auth/confirmation/{email}/{token} (unable to find a user for this verification)", async () => {
        const response = await request(server.getServer()).get("/auth/confirmation/admin@jedlik.eu/da57e842d34a7f3626c7680f829c66f1");
        expect(response.statusCode).toEqual(401);
        expect(response.body.message).toEqual("We were unable to find a user for this verification. Please SignUp!");
        expect(response.body.status).toEqual(401);
    });

    it("POST /auth/login (wrong email)", async () => {
        const response = await request(server.getServer()).post("/auth/login").send({
            email: "wrong@jedlik.eu",
            password: "kilincs",
        });
        expect(response.statusCode).toEqual(401);
        expect(response.body.message).toEqual("Wrong credentials provided");
        expect(response.body.status).toEqual(401);
    });

    it("POST /auth/login (wrong password)", async () => {
        const response = await request(server.getServer()).post("/auth/login").send({
            email: "admin@jedlik.eu",
            password: "rosszJelszó",
        });
        expect(response.statusCode).toEqual(401);
        expect(response.body.message).toEqual("Wrong credentials provided");
        expect(response.body.status).toEqual(401);
    });

    it("POST /auth/login (correct password)", async () => {
        const response = await request(server.getServer()).post("/auth/login").send({
            email: "admin@jedlik.eu",
            password: "admin",
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body._id).toEqual("aaaa00000000000000000001");
        expect(response.body.email).toEqual("admin@jedlik.eu");
        expect(response.body.name).toEqual("admin");
    });

    it("POST /auth/autologin", async () => {
        // Login with admin
        await request(server.getServer()).post("/auth/login").send({
            email: "admin@jedlik.eu",
            password: "admin",
        });
        // logout
        await request(server.getServer()).post("/auth/logout");
        // autologin
        const response = await request(server.getServer()).post("/auth/autologin").set("Cookie", cookie);;
        expect(response.statusCode).toEqual(200);
        expect(response.body._id).toEqual("aaaa00000000000000000001");
        expect(response.body.email).toEqual("admin@jedlik.eu");
        expect(response.body.name).toEqual("admin");
    });

    it("GET /auth/logout", async () => {
        const response = await request(server.getServer()).post("/auth/logout");
        expect(response.statusCode).toEqual(204);
    });
});
