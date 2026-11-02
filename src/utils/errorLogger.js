// ==================== src/utils/errorLogger.js ====================
// Lightweight error & log buffer to provide automatic telemetry to the QA AI pipeline

const MAX_BUFFERED_ERRORS = 10;
const errorBuffer = [];

// Initialize interceptor once
let isInitialized = false;

export const initErrorLogger = () => {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  const originalConsoleError = console.error;

  console.error = function (...args) {
    try {
      const message = args
        .map(arg => {
          if (typeof arg === 'string') return arg;
          if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .join(' ');

      pushError(`[console.error] ${message}`);
    } catch {
      // Ignore interceptor errors
    }
    originalConsoleError.apply(console, args);
  };

  window.addEventListener('error', (event) => {
    try {
      const msg = event.error 
        ? `${event.error.name}: ${event.error.message}\n${event.error.stack || ''}`
        : event.message;
      pushError(`[window.error] ${msg} at ${event.filename}:${event.lineno}:${event.colno}`);
    } catch {
      // Ignore
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason;
      const msg = reason instanceof Error 
        ? `${reason.name}: ${reason.message}\n${reason.stack || ''}` 
        : String(reason);
      pushError(`[unhandledrejection] ${msg}`);
    } catch {
      // Ignore
    }
  });
};

const pushError = (errString) => {
  const timestamp = new Date().toLocaleTimeString();
  errorBuffer.push(`[${timestamp}] ${errString}`);
  if (errorBuffer.length > MAX_BUFFERED_ERRORS) {
    errorBuffer.shift();
  }
};

export const getRecentErrors = () => {
  return [...errorBuffer];
};

export const clearRecentErrors = () => {
  errorBuffer.length = 0;
};
