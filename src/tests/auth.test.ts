import request from "supertest";
import { app } from "../app"; // Import your Express app
import { prisma } from "../db"; // Import your Prisma client
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mock dependencies
jest.mock("../db", () => ({
    prisma: {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Auth Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /api/v1/auth/register", () => {
        it("should register a new user", async () => {
            const userData = {
                email: "testuser@example.com",
                password: "password123",
                name: "Test User",
            };

            const hashedPassword = "hashed_password";
            (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            (prisma.user.create as jest.Mock).mockResolvedValue({
                id: "1",
                ...userData,
                password: hashedPassword,
            });

            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("message", "User created successfully");
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: userData.email,
                    password: hashedPassword,
                    name: userData.name,
                },
            });
        });

        it("should return 409 if the user already exists", async () => {
            const userData = {
                email: "testuser@example.com",
                password: "password123",
                name: "Test User",
            };

            (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
            (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
            (prisma.user.create as jest.Mock).mockRejectedValue({
                code: "P2002",
            });

            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userData);

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("error", "User already exists");
        });

        it("should return 400 for invalid input", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({ email: "invalid-email" });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });
    });

    describe("POST /api/v1/auth/login", () => {
        it("should login a user and return a token", async () => {
            const userData = {
                email: "testuser@example.com",
                password: "password123",
            };

            const userInDb = {
                id: "1",
                email: userData.email,
                password: "hashed_password",
                name: "Test User",
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(userInDb);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue("mock_token");

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(userData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Login successful");
            expect(response.body).toHaveProperty("token", "mock_token");
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: userData.email },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(userData.password, userInDb.password);
        });

        it("should return 404 if user is not found", async () => {
            const userData = {
                email: "nonexistent@example.com",
                password: "password123",
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(userData);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "User not found");
        });

        it("should return 401 for incorrect credentials", async () => {
            const userData = {
                email: "testuser@example.com",
                password: "wrongpassword",
            };

            const userInDb = {
                id: "1",
                email: userData.email,
                password: "hashed_password",
                name: "Test User",
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(userInDb);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const response = await request(app)
                .post("/api/v1/auth/login")
                .send(userData);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Invalid credentials");
        });

        it("should return 400 for invalid input", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: "invalid-email" });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });
    });
});
