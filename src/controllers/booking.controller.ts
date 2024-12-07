import { Request, Response } from "express"
import { prisma } from "../db";
import { bookSeatSchema } from "../interfaces/booking";

/**
 * @swagger
 * tags:
 *   - name: Booking
 *     description: Booking management operations
 */

/**
 * @swagger
 * /api/v1/booking/getSeatAvailability:
 *   get:
 *     summary: Get available trains between source and destination
 *     description: This endpoint allows users to get available trains between the specified source and destination along with available seats.
 *     tags: [Booking]
 *     parameters:
 *       - name: source
 *         in: query
 *         description: The source station
 *         required: true
 *         schema:
 *           type: string
 *           example: "Mumbai"
 *       - name: destination
 *         in: query
 *         description: The destination station
 *         required: true
 *         schema:
 *           type: string
 *           example: "Delhi"
 *     responses:
 *       200:
 *         description: List of available trains
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trains:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Express 101"
 *                       availableSeats:
 *                         type: integer
 *                         example: 50
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 */
export const getSeatAvailability = async (req: Request, res: Response) => {
    const { source, destination } = req.query as unknown as { source: string, destination: string };

    const trains = await prisma.train.findMany({
        where: { source, destination },
        select: { id: true, name: true, availableSeats: true }
    });

    res.json({ trains });
};

/**
 * @swagger
 * /api/v1/booking/bookSeat:
 *   post:
 *     summary: Book a seat on a train
 *     description: This endpoint allows a user to book a seat on a train. The seat count will be updated, and a booking record will be created.
 *     tags: [Booking]
 *     requestBody:
 *       description: The details of the booking (train ID and user ID)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trainId:
 *                 type: integer
 *                 example: 1
 *               userId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Seat booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seat booked successfully"
 *                 bookingId:
 *                   type: integer
 *                   example: 123
 *       400:
 *         description: Bad request, validation error
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /api/v1/booking/{id}:
 *   get:
 *     summary: Get booking details
 *     description: This endpoint retrieves the details of a booking by its ID.
 *     tags: [Booking]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The booking ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     train:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "Express 101"
 *                         availableSeats:
 *                           type: integer
 *                           example: 50
 *       400:
 *         description: Invalid booking ID
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal Server Error
 */
export const getBooking = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (Number.isNaN(Number(id))) {
        res.status(400).json({ error: "Invalid booking ID" });
        return;
    }

    const bookings = await prisma.booking.findUnique({
        where: { id: Number(id) },
        include: { train: true },
    });

    if (!bookings) {
        res.status(404).json({ error: "Booking not found" });
        return;
    }

    res.json({ bookings });
};
