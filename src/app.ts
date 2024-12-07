import express, { Request, Response } from "express"
import cors from "cors"
import authRoutes from "./routes/auth.routes"
import adminRoutes from "./routes/admin.routes"
import bookingRoutes from "./routes/booking.routes"
import dotenv from "dotenv"
import YAML from "yamljs"
import swaggerUi from "swagger-ui-express"

dotenv.config()

export const app = express()
const swaggerDocument = YAML.load("./swagger.yaml");
const port: number = 5000;

app.use(express.json())
app.use(cors())

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/admin", adminRoutes)
app.use("/api/v1/booking", bookingRoutes)
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// BASIC HEALTH CHECK
app.get("/ping", (req: Request, res: Response) => {
    res.json({ "msg": "works" })
})

if (process.env.NODE_ENV !== "test") {
    app.listen(5000, () => {
        console.log("SERVER LISTENING ON PORT 5000");
    });
}
