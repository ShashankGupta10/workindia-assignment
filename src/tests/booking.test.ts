import request from 'supertest';
import { app } from '../app';  // Assuming app is your Express app
import { prisma } from '../db'; // Prisma client instance

jest.mock('../db', () => ({
    prisma: {
        train: {
            findMany: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
        booking: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
        $transaction: jest.fn(), // Mock $transaction method
    },
}));

const bearerToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImlhdCI6MTczMzU1NDgxMywiZXhwIjoxNzMzNTU4NDEzfQ.n891pAZdmhA4rTsEXqoztQGq6cwk2NwC26Rwu_tgzVQ`;

describe('GET /api/v1/booking/getSeatAvailability', () => {
    it('should return available trains based on source and destination', async () => {
        const mockTrains = [
            { id: 1, name: 'Train 1', availableSeats: 50 },
            { id: 2, name: 'Train 2', availableSeats: 30 },
        ];

        (prisma.train.findMany as jest.Mock).mockResolvedValue(mockTrains);

        const response = await request(app)
            .get('/api/v1/booking/getSeatAvailability')
            .set('Authorization', bearerToken)
            .query({ source: 'Station A', destination: 'Station B' });

        expect(response.status).toBe(200);
        expect(response.body.trains).toEqual(mockTrains);
    });
});

describe('POST /api/v1/book-seat', () => {
    it('should successfully book a seat', async () => {
        const mockTrain = { id: 1, availableSeats: 10 };
        const mockBooking = { id: 1 };

        (prisma.train.findUnique as jest.Mock).mockResolvedValue(mockTrain);
        (prisma.train.update as jest.Mock).mockResolvedValue(mockTrain);
        (prisma.booking.create as jest.Mock).mockResolvedValue(mockBooking);

        const bookingRequest = { trainId: 1 };

        const response = await request(app)
            .post('/api/v1/booking/bookSeat')
            .set('Authorization', bearerToken)
            .send(bookingRequest);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Seat booked successfully');
    });
});


describe('POST /api/v1/book-seat', () => {
    it('should return 400 if input data is invalid', async () => {
        const invalidBookingRequest = { trainId: "shashank" };  // Invalid data

        const response = await request(app)
            .post('/api/v1/booking/bookSeat')
            .set('Authorization', bearerToken)
            .send(invalidBookingRequest);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("trainId");
        expect(response.body.error).toContain("Expected number, received string: trainId");
    });
});

describe('GET /api/v1/booking/:id', () => {
    it('should return booking details based on ID', async () => {
        const mockBooking = {
            id: 1,
            userId: 123,
            train: { id: 1, name: 'Train 1', source: 'Station A', destination: 'Station B' },
        };

        (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

        const response = await request(app)
            .get('/api/v1/booking/1')
            .set('Authorization', bearerToken);

        expect(response.status).toBe(200);
        expect(response.body.bookings).toEqual(mockBooking);
    });
});