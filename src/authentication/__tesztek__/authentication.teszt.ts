import "dotenv/config";

import request from "supertest";

import App from "../../app";
import AuthenticationController from "../authentication.controller";

let server: App;

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
});

describe("test API endpoints", () => {
    it("GET /auth/register", async () => {
        const response = await request(server.getServer())
            .post("/auth/register")
            .send({
                name: "student001",
                email: "student001@jedlik.eu",
                email_verified: true,
                auto_login: true,
                picture: "none",
                roles: ["admin"],
                password: "student001",
                address: {
                    city: "Győr",
                    country: "Hungary",
                    street: "Futrinka u. 13.",
                },
            });
        expect(response.statusCode).toEqual(400);
        expect(response.body.message).toEqual("User with email student001@jedlik.eu already exists");
        expect(response.body.status).toEqual(400);
    });

    it("GET /auth/login", async () => {
        const response = await request(server.getServer()).post("/auth/login").send({
            email: "student001@jedlik.eu",
            password: "student001",
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body._id).toEqual("a11111111111111111111111");
        expect(response.body.address.city).toEqual("Győr");
        expect(response.body.address.country).toEqual("Hungary");
        expect(response.body.address.street).toEqual("Futrinka utca 13.");
        expect(response.body.address._id).toEqual("b11111111111111111111111");
        expect(response.body.email).toEqual("student001@jedlik.eu");
        expect(response.body.name).toEqual("student001");
    });

    it("GET /auth/logout", async () => {
        const response = await request(server.getServer()).post("/auth/logout");
        expect(response.text).toEqual("OK");
        expect(response.statusCode).toEqual(200);
    });
});
