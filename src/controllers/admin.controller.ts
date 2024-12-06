import { Request, Response } from "express"
import { loginSchema, registerSchema } from "../interfaces/auth";
import { prisma } from "../db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const addTrain = async (req: Request, res: Response) => {
    console.log("ADD TRAIN");
}
