// Detect runtime environment
const isCloudflareWorkers =
  typeof navigator !== 'undefined' && navigator.userAgent?.includes('Cloudflare-Workers');
const isVercelEdge = typeof (globalThis as Record<string, unknown>).EdgeRuntime !== 'undefined';
const isBrowser = typeof window !== 'undefined';
const isEdgeRuntime = isCloudflareWorkers || isVercelEdge || isBrowser;

// Simple logger interface, compatible with pino
interface SimpleLogger {
  info: (obj: Record<string, unknown> | string, msg?: string) => void;
  warn: (obj: Record<string, unknown> | string, msg?: string) => void;
  error: (obj: Record<string, unknown> | string, msg?: string) => void;
  debug: (obj: Record<string, unknown> | string, msg?: string) => void;
  trace: (obj: Record<string, unknown> | string, msg?: string) => void;
  fatal: (obj: Record<string, unknown> | string, msg?: string) => void;
  child: (obj: Record<string, unknown>) => SimpleLogger;
}

// Safe JSON stringification that handles circular references and special values
function safeStringify(obj: unknown): string {
  const seen = new WeakSet<object>();

  try {
    return JSON.stringify(obj, (key, value) => {
      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      // Handle BigInt
      if (typeof value === 'bigint') {
        return value.toString();
      }
      // Handle undefined
      if (value === undefined) {
        return '[Undefined]';
      }
      // Handle functions
      if (typeof value === 'function') {
        return '[Function]';
      }
      return value;
    });
  } catch (error) {
    return `[Unserializable: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}

// Create a simple logger implementation for Edge Runtime
function createEdgeLogger(prefix = ''): SimpleLogger {
  const logWithPrefix = (level: string, obj: Record<string, unknown> | string, msg?: string) => {
    const timestamp = new Date().toISOString();
    const logObj = typeof obj === 'object' ? obj : { message: obj };
    const message = msg || logObj.message || '';
    const fullMessage = prefix ? `[${prefix}] ${message}` : message;

    const logData = {
      level,
      time: timestamp,
      ...logObj,
      msg: fullMessage,
    };

    // 使用对应的 console 方法和安全的 JSON 序列化
    const logString = safeStringify(logData);
    switch (level) {
      case 'error':
      case 'fatal':
        console.error(logString);
        break;
      case 'warn':
        console.warn(logString);
        break;
      case 'debug':
      case 'trace':
        console.debug(logString);
        break;
      default:
        console.log(logString);
    }
  };

  return {
    info: (obj, msg) => logWithPrefix('info', obj, msg),
    warn: (obj, msg) => logWithPrefix('warn', obj, msg),
    error: (obj, msg) => logWithPrefix('error', obj, msg),
    debug: (obj, msg) => logWithPrefix('debug', obj, msg),
    trace: (obj, msg) => logWithPrefix('trace', obj, msg),
    fatal: (obj, msg) => logWithPrefix('fatal', obj, msg),
    child: (obj) =>
      createEdgeLogger(
        prefix
          ? `${prefix}:${(obj.service as string) || 'child'}`
          : (obj.service as string) || 'child'
      ),
  };
}

// Lazy initialization to avoid top-level await
let logger: SimpleLogger | null = null;

function getLogger(): SimpleLogger {
  if (logger) {
    return logger;
  }

  if (isEdgeRuntime) {
    logger = createEdgeLogger();
  } else {
    // Use require for synchronous loading in Node.js environment
    const pino = require('pino');

    logger = pino({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      ...(process.env.NODE_ENV === 'production' && {
        formatters: {
          level: (label: string) => {
            return { level: label };
          },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }),
    });
  }

  if (!logger) {
    throw new Error('Logger failed to initialize');
  }

  return logger;
}

export const createChildLogger = (name: string) => {
  return getLogger().child({ service: name });
};

// Export a proxy object that lazily initializes the logger
export default new Proxy({} as SimpleLogger, {
  get(target, prop) {
    const actualLogger = getLogger();
    const value = actualLogger[prop as keyof SimpleLogger];
    return typeof value === 'function' ? value.bind(actualLogger) : value;
  },
});
