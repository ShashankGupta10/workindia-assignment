import { z } from "zod";

export const bookSeatSchema = z.object({
    trainId: z.number().positive(),
    userId: z.number().positive(),
})

export type BookSeatInput = z.infer<typeof bookSeatSchema>