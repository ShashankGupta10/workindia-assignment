import { Router } from "express";
import { getSeatAvailability, bookSeat, getBooking } from "../controllers/booking.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router()

router.route("/getSeatAvailability").get(authMiddleware, getSeatAvailability)
router.route("/bookSeat").post(authMiddleware, bookSeat)
router.route("/:id").get(authMiddleware, getBooking)

export default router