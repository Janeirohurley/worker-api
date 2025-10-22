import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateDTO = (schema: ZodSchema<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error.issues[0].message
            });
        }
        req.body = result.data;
        next();
    };
};
