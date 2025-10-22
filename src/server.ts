import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.routes";
import { requestLogger, errorLogger } from "./middlewares/logger.middleware";
import { metricsMiddleware, getMetrics } from "./middlewares/metrics.middleware";

dotenv.config();
const app = express();

// Swagger definition
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "Worker API",
        version: "1.0.0",
        description: "API for worker authentication and management",
    },
    servers: [
        {
            url: "http://localhost:4000",
            description: "Development server",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ["./src/controllers/*.ts"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

app.use(cors());
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Logging middleware
app.use(requestLogger);

// Metrics middleware
app.use(metricsMiddleware);

// Routes
app.use("/api/v1/auth", authRoutes);

// Metrics endpoint for Prometheus
app.get("/metrics", async (req, res) => {
    try {
        const metrics = await getMetrics();
        res.set("Content-Type", "text/plain; charset=utf-8");
        res.send(metrics);
    } catch (err) {
        res.status(500).send("Error generating metrics");
    }
});

// Error logging middleware (must be last)
app.use(errorLogger);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API Auth v1 running on port ${PORT}`));
