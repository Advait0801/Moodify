import { error, warn } from "node:console";

export const logger = {
    info: (message: string, ...args: any[]) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    },

    error: (message: string, ...args: any[]) => {
        console.log(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    },

    warn: (message: string, ...args: any[]) => {
        console.log(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    },
};