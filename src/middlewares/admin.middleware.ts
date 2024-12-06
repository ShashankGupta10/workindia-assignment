import { Request, Response, NextFunction } from "express";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const adminAPIKey = req.headers["X-API-KEY"];
    if (!adminAPIKey || adminAPIKey !== process.env.ADMIN_API_KEY) {
        res.status(401).json({ error: "Unauthorized" });
        return
    }
    next();
}