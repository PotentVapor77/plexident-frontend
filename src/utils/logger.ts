/**
 * ============================================================================
 * LOGGER SYSTEM - ✅ CORREGIDO (sin info sensible)
 * ============================================================================
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'api';

export interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  private log(
    level: LogLevel,
    message: string,
    data?: unknown,
    context?: LogContext
  ) {
    const timestamp = new Date().toISOString();

    // En desarrollo: console logs
    if (this.isDevelopment) {
      const prefix = `[${level.toUpperCase()}]`;
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      
      // ✅ CORREGIDO: Filtrar información sensible
      const safeData = this.sanitizeData(data);
      
      console[consoleMethod](
        `${prefix} [${timestamp}] ${message}`,
        safeData || '',
        context || ''
      );
    }

    // En producción: enviar a Sentry
    if (this.isProduction && level === 'error') {
      // Sentry.captureException(data, {
      //   tags: { context: message },
      //   extra: context,
      // });
    }
  }

  // ✅ NUEVO: Sanitizar datos sensibles
  private sanitizeData(data: unknown): unknown {
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = { ...data };
      
      // Eliminar campos sensibles
      const sensitiveFields = ['password', 'token', 'access_token', 'refresh_token'];
      
      for (const field of sensitiveFields) {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  info(message: string, data?: unknown, context?: LogContext) {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: unknown, context?: LogContext) {
    this.log('warn', message, data, context);
  }

  error(message: string, error: unknown, context?: LogContext) {
    this.log('error', message, error, context);
  }

  debug(message: string, data?: unknown, context?: LogContext) {
    if (this.isDevelopment) {
      this.log('debug', message, data, context);
    }
  }

  api(method: string, endpoint: string, duration?: number, error?: unknown) {
    if (error) {
      this.log('api', `API Error: ${method} ${endpoint}`, error);
    } else {
      this.log('api', `API Call: ${method} ${endpoint}`, { duration: `${duration}ms` });
    }
  }

  // ✅ CORREGIDO: No loguear username
  auth(event: string) {
    this.info(`Auth: ${event}`);
  }
}

export const logger = new Logger();
