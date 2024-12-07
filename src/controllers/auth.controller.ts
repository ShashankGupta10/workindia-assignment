import { Request, Response } from "express"
import { loginSchema, registerSchema } from "../interfaces/auth";
import { prisma } from "../db";
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication operations
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: This endpoint allows a user to register by providing a name, email, and password.
 *     tags: [Auth]
 *     requestBody:
 *       description: User registration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *       400:
 *         description: Bad request, validation error
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal Server Error
 */

export const register = async (req: Request, res: Response) => {
    const { success, data, error } = registerSchema.safeParse(req.body);
    if (!success) {
        res.status(400).json({ error: `${error?.errors[0]?.message}: ${error.errors[0]?.path}` });
        return;
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    try {
        const newUser = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name
            }
        })
        res.status(201).json({ data: newUser, message: "User created successfully" });

    } catch (err) {
        // @ts-ignore
        if (err && err.code && err.code === "P2002") {
            console.log("HERE");
            res.status(409).json({ error: "User already exists" });
            return;
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
}

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     description: This endpoint allows a registered user to login by providing their email and password. A JWT token will be returned on successful authentication.
 *     tags: [Auth]
 *     requestBody:
 *       description: User login details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: "jwt_token_here"
 *       400:
 *         description: Bad request, validation error
 *       404:
 *         description: User not found
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal Server Error
 */

export const login = async (req: Request, res: Response) => {
    const { success, data, error } = loginSchema.safeParse(req.body);
    if (!success) {
        res.status(400).json({ error: `${error?.errors[0]?.message}: ${error?.errors[0]?.path}` });
        return;
    }

    try {
        const userExists = await prisma.user.findUnique({
            where: {
                email: data.email,
            }
        })
        if (!userExists) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const passwordMatch = await bcrypt.compare(data.password, userExists.password);
        if (!passwordMatch) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const jwtToken = jwt.sign({ id: userExists.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token: jwtToken });
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            res.status(409).json({ error: "User already exists" });
            return;
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
}