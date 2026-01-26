import { MoodHistoryWorker } from "./workers/mood-history.worker";
import { logger } from "./utils/logger.util";

const worker = new MoodHistoryWorker();

process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shuttinf down gracefully');
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await worker.stop();
    process.exit(0);
});

worker.start().catch((error) => {
    logger.error('Worker failed to start:', error);
    process.exit(1);
});