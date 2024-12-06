import { Request, Response, NextFunction } from "express";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const adminAPIKey = req.headers["x-admin-api-key"];
    if (!adminAPIKey || adminAPIKey !== process.env.ADMIN_API_KEY) {
        res.status(401).json({ error: "Unauthorized" });
        return
    }
    next();
}