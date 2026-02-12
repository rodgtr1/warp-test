/**
 * BookIt Logger
 * Provides structured logging with clear prefixes for debugging
 */

type LogLevel = 'ACTION' | 'STATE' | 'AUTH' | 'API' | 'ERROR' | 'DEBUG';

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

export const logger = {
  action: (message: string, data?: unknown) => {
    console.log(`[${formatTimestamp()}] [ACTION] ${message}`);
    if (data !== undefined) {
      console.log(`[ACTION] Data:`, JSON.stringify(data, null, 2));
    }
  },

  state: (message: string, data?: unknown) => {
    console.log(`[${formatTimestamp()}] [STATE] ${message}`);
    if (data !== undefined) {
      console.log(`[STATE] Data:`, JSON.stringify(data, null, 2));
    }
  },

  auth: (message: string, data?: unknown) => {
    console.log(`[${formatTimestamp()}] [AUTH] ${message}`);
    if (data !== undefined) {
      const safeData = { ...data as Record<string, unknown> };
      if ('password' in safeData) {
        safeData.password = '***REDACTED***';
      }
      console.log(`[AUTH] Data:`, JSON.stringify(safeData, null, 2));
    }
  },

  api: (message: string, data?: unknown) => {
    console.log(`[${formatTimestamp()}] [API] ${message}`);
    if (data !== undefined) {
      console.log(`[API] Data:`, JSON.stringify(data, null, 2));
    }
  },

  error: (message: string, error?: unknown) => {
    console.error(`[${formatTimestamp()}] [ERROR] ${message}`);
    if (error !== undefined) {
      if (error instanceof Error) {
        console.error(`[ERROR] Stack:`, error.stack);
      } else {
        console.error(`[ERROR] Details:`, JSON.stringify(error, null, 2));
      }
    }
  },

  debug: (message: string, data?: unknown) => {
    console.log(`[${formatTimestamp()}] [DEBUG] ${message}`);
    if (data !== undefined) {
      console.log(`[DEBUG] Data:`, JSON.stringify(data, null, 2));
    }
  },
};

export default logger;
