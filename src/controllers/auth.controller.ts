import { Request, Response } from "express"
import { loginSchema, registerSchema } from "../interfaces/auth";
import { prisma } from "../db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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