import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const jwtToken = req.headers.authorization?.split(" ")[1];
    if (!jwtToken) {
        res.status(401).json({ error: "Unauthorized" });
        return
    }
    const userId = jwt.verify(jwtToken, process.env.JWT_SECRET!);
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return
    }
    req.body.userId = userId;
    next();
}