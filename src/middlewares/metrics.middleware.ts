import { Request, Response, NextFunction } from "express";
import promClient from "prom-client";

const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.1, 0.5, 1, 2.5, 5, 10],
});

const httpRequestsTotal = new promClient.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000; // in seconds

        const route = req.route ? req.route.path : req.path;

        httpRequestDuration.observe(
            { method: req.method, route, status_code: res.statusCode },
            duration
        );

        httpRequestsTotal.inc({
            method: req.method,
            route,
            status_code: res.statusCode,
        });
    });

    next();
};

export const getMetrics = async () => {
    return register.metrics();
};
