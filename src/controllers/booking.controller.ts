import { Request, Response } from "express"
import { prisma } from "../db";
import { bookSeatSchema } from "../interfaces/booking";

export const getSeatAvailability = async (req: Request, res: Response) => {
    const { source, destination } = req.query as unknown as { source: string, destination: string };

    const trains = await prisma.train.findMany({
        where: { source, destination },
        select: { id: true, name: true, availableSeats: true }
    });

    res.json({ trains });
};

export const bookSeat = async (req: Request, res: Response) => {
    const { success, data, error } = bookSeatSchema.safeParse(req.body);
    if (!success) {
        res.status(400).json({ error: `${error?.errors[0]?.message}: ${error.errors[0]?.path}` });
        return;
    }

    const { trainId, userId } = data;

    const bookingId = await prisma.$transaction(async (tx) => {
        const train = await tx.train.findUnique({
            where: { id: trainId },
            select: { id: true, availableSeats: true },
        });

        if (!train || train.availableSeats <= 0) {
            throw new Error("No seats available");
        }

        await tx.train.update({
            where: { id: trainId },
            data: { availableSeats: train.availableSeats - 1 },
        });

        const resp = await tx.booking.create({
            data: { userId: userId, trainId },
        });
        return resp.id;
    });

    res.json({ message: "Seat booked successfully", bookingId });
};

export const getBooking = async (req: Request, res: Response) => {
    const { id } = req.params;

    const bookings = await prisma.booking.findUnique({
        where: { id: Number(id) },
        include: { train: true },
    });

    res.json({ bookings });
};