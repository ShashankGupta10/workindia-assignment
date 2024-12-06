import { z } from "zod";

export const addTrainSchema = z.object({
    name: z.string().min(2, { message: "Name should be atleast 2 characters long" }),
    source: z.string().min(2, { message: "Source should be atleast 2 characters long" }),
    destination: z.string().min(2, { message: "Destination should be atleast 2 characters long" }),
    totalSeats: z.number().int().positive(),
    availableSeats: z.number().int().positive(),
});

export type AddTrain = z.infer<typeof addTrainSchema>;