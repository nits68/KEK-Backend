import request from "supertest";

import App from "../../app";
import AuthenticationController from "../../authentication/authentication.controller";
import OfferController from "../offer.controller";

// let server: Express.Application;
let cookie: string | any;
let server: App;

beforeAll(async () => {
    // create server for test:
    server = new App([new AuthenticationController(), new OfferController()]);
    // connect and get cookie for authentication
    await server
        .connectToTheDatabase("5002")
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

describe("test offers endpoints", () => {
    let id: string;

    it("GET /offers", async () => {
        // get response with supertest-response:
        const response = await request(server.getServer()).get("/offers");
        // check response with jest:
        expect(response.statusCode).toEqual(200);
        expect(response.header["x-total-count"]).toEqual("14"); // basically 14
        expect(response.body[0]._id).toEqual("bbbb00000000000000000001");
        expect(response.body[0].user_id).toEqual("aaaa00000000000000000001");
        expect(response.body[0].quantity).toEqual(200);
        expect(response.body[0].unit).toEqual("kg");
        expect(response.body[0].unit_price).toEqual(800);
    });

    it("POST /offers", async () => {
        const response = await request(server.getServer()).post("/offers").set("Cookie", cookie).send({
            _id: "bbbb00000000000000000999",
            user_id: "aaaa00000000000000000001",
            product_id: "dddd00000000000000000001",
            offer_start: "2024-05-18T00:00:00.000Z",
            offer_end: null,
            unit_price: 1500,
            unit: "kg",
            quantity: 10,
            picture_url: "https://i.imgur.com/WDldL38.jpg",
            info: "fóliasátras termelesztés",
        });
        id = response.body._id; // this document will be modified and deleted in the following 2 tests:
        expect(response.statusCode).toEqual(200);
    });

    it("PATCH /offers/:id (unit_price cannot be modified)", async () => {
        const response = await request(server.getServer()).patch(`/offers/${id}`).set("Cookie", cookie).send({
            unit_price: 1599,
        });
        expect(response.statusCode).toEqual(403);
        expect(response.body.message).toEqual("The unit_price cannot be modified! Try delete document and create a new offer.");
    });

    it("PATCH /offers/:id (modify quantity)", async () => {
        const response = await request(server.getServer()).patch(`/offers/${id}`).set("Cookie", cookie).send({
            "quantity": 999,
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.quantity).toEqual(999);
    });

    it("DELETE /offers/:id", async () => {
        const response = await request(server.getServer()).delete(`/offers/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
    });

    it("GET /offers/:offset/:limit/:sortField/:filter (paginating with filter)", async () => {
        const response = await request(server.getServer()).get("/offers/0/10/_id/alma").set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
        expect(response.headers["x-total-count"]).toEqual("2");
        expect(response.body[0].product.product_name).toMatch("Jonatán alma");
        expect(response.body[0].offer.name).toMatch("admin");
        expect(response.body[0].unit).toMatch("kg");
        expect(response.body[0].unit_price).toEqual(800);
        expect(response.body[0].quantity).toEqual(200);
        expect(response.body[0].info).toMatch("nem volt permetezve, min. 1kg-os tételben");
    });

    it("GET /offers/:offset/:limit/:sortField/:filter (get actual offers with paginating and filtering)", async () => {
        const response = await request(server.getServer()).get("/offers/active/0/2/_id/szilva").set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toEqual(2);
        expect(response.headers["x-total-count"]).toEqual("5");
        expect(response.body[0].product.product_name).toMatch("Penyigei szilva");
        expect(response.body[0].offer.name).toMatch("admin");
        expect(response.body[0].unit).toMatch("kg");
        expect(response.body[0].unit_price).toEqual(300);
        expect(response.body[0].quantity).toEqual(123);
        expect(response.body[0].info).toMatch(/pálikafőzéshez, min. 10kg-os tételben/);
    });

    // Példa tesztek

    // it("GET /offers/:offset/:limit/:sortField/:filter? (search for missing 'keyword')", async () => {
    //     const response = await request(server.getServer()).get("/offers/0/5/description/goesiéhgesouihg").set("Cookie", cookie);
    //     expect(response.statusCode).toEqual(200);
    //     expect(response.headers["x-total-count"]).toEqual("0");
    // });

    // it("GET /offers/:offset/:limit/:sortField/:filter? (no last parameter 'filter')", async () => {
    //     const response = await request(server.getServer()).get("/offers/0/5/description").set("Cookie", cookie);
    //     expect(response.statusCode).toEqual(200);
    //     expect(response.headers["x-total-count"]).toEqual("10");
    // });

    // it("GET /offers/offers/:id  (correct id)", async () => {
    //     id = "daaaaaaaaaaaaaaaaaaaaaaa";
    //     const response = await request(server.getServer()).get(`/offers/${id}`).set("Cookie", cookie);
    //     expect(response.statusCode).toEqual(200);
    //     expect(response.body.recipeName).toEqual("KELKÁPOSZTA FŐZELÉK");
    // });

    // it("GET /offers/:id  (missing, but valid id)", async () => {
    //     id = "6367f3038ae13010a4c9ab49";
    //     const response = await request(server.getServer()).get(`/offers/${id}`).set("Cookie", cookie);
    //     expect(response.statusCode).toEqual(404);
    //     expect(response.body.message).toEqual(`Recipe with id ${id} not found`);
    // });

    // it("GET /offers/:id  (not valid object id)", async () => {
    //     id = "61dc03c0e397a1e9cf988b3";
    //     const response = await request(server.getServer()).get(`/offers/${id}`).set("Cookie", cookie);
    //     expect(response.statusCode).toEqual(404);
    //     expect(response.body.message).toEqual(`This ${id} id is not valid.`);
    // });

    // it("DELETE /offers/:id  (not valid object id)", async () => {
    //     const response = await request(server.getServer()).delete(`/offers/${id}`).set("Cookie", cookie);
    //     expect(response.statusCode).toEqual(404);
    //     expect(response.body.message).toEqual(`This ${id} id is not valid.`);
    // });

    // it("PATCH /offers:id  (not valid object id)", async () => {
    //     const response = await request(server.getServer()).patch(`/offers/${id}`).set("Cookie", cookie);
    //     expect(response.statusCode).toEqual(404);
    //     expect(response.body.message).toEqual(`This ${id} id is not valid.`);
    // });

    // it("POST /offers, async () => {
    //     const response = await request(server.getServer())
    //         .post("/offers")
    //         .set("Cookie", cookie)
    //         .send({
    //             recipeName: "Mock recipe by Ányos",
    //             imageURL: "https://jedlik.eu/images/Jedlik-logo-2020-200.png",
    //             description: "I'll be deleted soon",
    //             ingredients: ["asa", "sas"],
    //         });
    //     id = response.body._id; // this document will be modified and deleted in the following 2 tests:
    //     expect(response.statusCode).toEqual(200);
    // });

    // it("PATCH /offers/:id", async () => {
    //     const response = await request(server.getServer()).patch(`/offers/${id}`).set("Cookie", cookie).send({
    //         recipeName: "asdasd",
    //     });
    //     expect(response.statusCode).toEqual(200);
    // });

    // it("DELETE /offers/:id", async () => {
    //     const response = await request(server.getServer()).delete(`/offers/${id}`).set("Cookie", cookie);
    //     expect(response.statusCode).toEqual(200);
    // });

    // it("DELETE /offers/:id (missing, but valid id)", async () => {
    //     id = "6367f3038ae13010a4c9ab49";
    //     const response = await request(server.getServer()).delete(`/offers/${id}`).set("Cookie", cookie);
    //     expect(response.statusCode).toEqual(404);
    //     expect(response.body.message).toEqual(`Recipe with id ${id} not found`);
    // });

    // it("PATCH /offers/:id (missing, but valid id)", async () => {
    //     const response = await request(server.getServer()).patch(`/offers/${id}`).set("Cookie", cookie).send({
    //         recipeName: "asdasd",
    //     });
    //     expect(response.statusCode).toEqual(404);
    //     expect(response.body.message).toEqual(`Recipe with id ${id} not found`);
    // });
});
