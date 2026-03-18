import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";


export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: "Token manquant" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = verifyToken(token);
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
