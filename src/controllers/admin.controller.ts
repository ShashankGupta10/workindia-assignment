import { Request, Response } from "express"
import { prisma } from "../db";
import { addTrainSchema } from "../interfaces/train";

export const addTrain = async (req: Request, res: Response) => {
    const { success, data, error } = addTrainSchema.safeParse(req.body);
    if (!success) {
        res.status(400).json({ error: `${error?.errors[0]?.message}: ${error.errors[0]?.path}` });
        return;
    }

    const { name, source, destination, totalSeats } = data;
    
    const train = await prisma.train.create({
        data: { name, source, destination, totalSeats, availableSeats: totalSeats }
    });

    res.status(201).json({ message: "Train added successfully", train });
}