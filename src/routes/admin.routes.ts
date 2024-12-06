import { Router } from "express";
import { addTrain } from "../controllers/admin.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
const router = Router()

router.route("/addTrain").post(adminMiddleware, addTrain)

export default router