import request from "supertest";
import { app } from "../app"; // Assuming app is your Express app
import { prisma } from "../db"; // Prisma client instance

jest.mock("../db", () => ({
    prisma: {
        train: {
            create: jest.fn(),
        },
    },
}));

const adminApiKey = "shreyas"; // Set the admin API key to match your application's expected value

describe("POST /api/v1/trains", () => {
    it("should add a new train successfully", async () => {
        const newTrain = {
            name: "Train 1",
            source: "Station A",
            destination: "Station B",
            totalSeats: 100,
            availableSeats: 100,
        };

        (prisma.train.create as jest.Mock).mockResolvedValue({
            ...newTrain,
            availableSeats: newTrain.totalSeats,
            id: 1,
        });

        const response = await request(app)
            .post("/api/v1/admin/addTrain")
            .set({ "x-admin-api-key": adminApiKey })
            .send(newTrain);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Train added successfully");
        expect(response.body.train).toMatchObject(newTrain);
    });

    it("should return 400 if input data is invalid", async () => {
        const invalidTrain = {
            name: "",
            source: "Station A",
            destination: "Station B",
            totalSeats: -10, // Invalid value
            availableSeats: 100,
        };

        const response = await request(app)
            .post("/api/v1/admin/addTrain")
            .set("x-admin-api-key", adminApiKey)  // Include the admin API key in headers
            .send(invalidTrain);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("Name should be atleast 2 characters long: name");
    });

    it("should return 400 if required fields are missing", async () => {
        const invalidTrain = {
            source: "Station A",
            destination: "Station B",
            totalSeats: 100,
            availableSeats: 100,
        };

        const response = await request(app)
            .post("/api/v1/admin/addTrain")
            .set("x-admin-api-key", adminApiKey)  // Include the admin API key in headers
            .send(invalidTrain);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("name");
    });

    it("should return 401 if no admin API key is provided", async () => {
        const newTrain = {
            name: "Train 2",
            source: "Station C",
            destination: "Station D",
            totalSeats: 200,
            availableSeats: 100,
        };

        const response = await request(app)
            .post("/api/v1/admin/addTrain")
            .send(newTrain);

        expect(response.status).toBe(401); // Unauthorized if no admin API key is provided
        expect(response.body.error).toBe("Unauthorized");
    });
});
