import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config/config";
import { recommendationsRoutes } from "./routes/recommendations.routes";
import { logger } from "./utils/logger.util";

const app = Fastify({
    logger: false,
});

app.register(cors, {
    origin: true,
});

app.register(recommendationsRoutes);

app.get('/health', async () => {
    return { status: 'healthy', service: 'recommendation-engine' };
});

const start = async () => {
    try {
        await app.listen({ port: config.port, host: config.host });
        logger.info(`Recommendation Engine running on http://${config.host}:${config.port}`);
    } catch (err) {
        logger.error('Error starting server:', err);
        process.exit(1);
    }
};

start();