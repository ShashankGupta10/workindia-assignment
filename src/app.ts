import express, { Request, Response } from "express"
import cors from "cors"
import userRoutes from "./routes/auth.routes"
import adminRoutes from "./routes/admin.routes"

const app = express()
app.use(express.json())
app.use(cors())
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/admin", adminRoutes)


app.get("/ping", (req: Request, res: Response) => {
    res.json({ "msg": "works" })
})

app.listen(5000, () => {
    console.log("SERVER LISTENING ON PORT 5000");
})