import { Request, Response, NextFunction } from "express";
import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: "worker-api" },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.json()
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.json()
        }),
    ],
});

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Log incoming request
    logger.info("Incoming request", {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        headers: req.headers,
    });

    // Log response on finish
    res.on('finish', () => {
        const duration = Date.now() - start;

        logger.info("Outgoing response", {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        });
    });

    next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error("Unhandled error", {
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
    });
    next(err);
};
