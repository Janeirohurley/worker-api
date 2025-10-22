import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: "Token manquant" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET);
        (req as any).user = decoded;
        next();
    } catch {
        return res.status(401).json({ success: false, message: "Token invalide" });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!roles.includes(user.role)) {
            return res.status(403).json({ success: false, message: "Accès refusé" });
        }
        next();
    };
};
