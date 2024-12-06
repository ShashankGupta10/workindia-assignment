import { Router } from "express";
import { getSeatAvailability, bookSeat, getBooking } from "../controllers/booking.controller";
const router = Router()

router.route("/getSeatAvailability").get(getSeatAvailability)
router.route("/bookSeat").post(bookSeat)
router.route("/getBooking/:id").get(getBooking)

export default router