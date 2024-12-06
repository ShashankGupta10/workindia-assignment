import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const jwtToken = req.headers.authorization?.split(" ")[1];
    if (!jwtToken) {
        res.status(401).json({ error: "Unauthorized" });
        return
    }
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET!) as JwtPayload;
    if (!decoded.id) {
        res.status(401).json({ error: "Unauthorized" });
        return
    }
    req.body.userId = decoded.id;
    next();
}