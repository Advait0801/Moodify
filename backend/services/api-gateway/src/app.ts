import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { config } from "./config/config";
import { errorHandler } from "./middleware/error.middleware";
import { authRoutes } from "./routes/auth.routes";
import { usersRoutes } from "./routes/users.routes";
import { moodRoutes } from "./routes/mood.routes";
import { logger } from "./utils/logger.util";

const app = Fastify({
    logger: false,
});

app.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
});

app.register(multipart);

app.setErrorHandler(errorHandler);

app.register(authRoutes);
app.register(usersRoutes);
app.register(moodRoutes);

app.get('/health', async () => {
    return { status: 'healthy', service: 'api-gateway' };
});

const start = async () => {
    try {
        await app.listen({ port: config.port, host: config.host });
        logger.info(`API Gateway running on http://${config.host}:${config.port}`);
    } catch (err) {
        logger.error('Error starting server:', err);
        process.exit(1);
    }
};

start();