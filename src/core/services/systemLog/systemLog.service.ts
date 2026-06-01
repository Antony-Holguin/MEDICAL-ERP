import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/services';
import { LogLevel } from 'src/generated/prisma/client';
import { EncryptionService } from '../encryption/encryption.service';

/**
 * Service responsible for managing system logs and persisting them to the database.
 *
 * This service provides functionality to save log entries with different severity levels,
 * capturing contextual information such as HTTP request details, stack traces, and metadata.
 *
 * @class SystemLogService
 * @decorator Injectable
 *
 * @example
 * ```typescript
 * const systemLogService = new SystemLogService(prismaService);
 * await systemLogService.saveToDatabase(
 *   'Error processing request',
 *   LogLevel.ERROR,
 *   request,
 *   error
 * );
 * ```
 */

/**
 * Saves a log entry to the database with contextual information from the request.
 *
 * This method captures comprehensive information about the request including method, path,
 * headers, body, query parameters, and stack traces for exceptions. If saving to the database
 * fails, it falls back to logging the error without throwing to prevent request failures.
 *
 * @param {string} message - The log message to be saved
 * @param {LogLevel} level - The severity level of the log entry (INFO, WARN, ERROR, CRITICAL)
 * @param {any} request - The HTTP request object containing route, headers, and metadata
 * @param {unknown} exception - The exception or error object to be logged, if any
 * @returns {Promise<void>} A promise that resolves when the log is saved or fails silently
 *
 * @throws Does not throw errors; failures are logged internally to prevent request disruption
 */

/**
 * Determines the appropriate log level based on HTTP status code.
 *
 * Maps HTTP status codes to log severity levels following standard conventions:
 * - 500+: CRITICAL (server errors)
 * - 400-499: ERROR (client errors)
 * - 300-399: WARN (redirects)
 * - Below 300: INFO (success)
 *
 * @param {number} statusCode - The HTTP status code to evaluate
 * @returns {LogLevel} The corresponding log level for the given status code
 *
 * @example
 * ```typescript
 * const level = systemLogService.getLogLevel(404); // Returns LogLevel.ERROR
 * const level = systemLogService.getLogLevel(200); // Returns LogLevel.INFO
 * ```
 */
@Injectable()
export class SystemLogService {
  private readonly logger = new Logger(SystemLogService.name);

  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _encryptionService: EncryptionService,
  ) {}

  async saveToDatabase(
    message: string,
    level: LogLevel,
    request: any,
    exception: unknown,
  ): Promise<void> {
    try {
      await this._prismaService.systemLog.create({
        data: {
          level,
          message,
          service: request.route?.stack?.[0]?.name || 'Unknown',
          context: {
            method: request.method,
            path: request.url,
            requestId: request['X-Request-Id'],
            query: request.query,
            body: this._encryptionService.encryptData(
              JSON.stringify(request.body),
            ),
            headers: {
              'user-agent': request.headers['user-agent'],
              origin: request.headers['origin'],
            },
            ip: request.ip,
          },
          stack:
            exception instanceof Error
              ? exception.stack
              : JSON.stringify(exception),
        },
      });
    } catch (error) {
      // Fallback silencioso - no queremos que falle el request si falla el log
      this.logger.error('Error saving to SystemLog table', error);
    }
  }

  /**
   * Determines the appropriate log level based on an HTTP status code.
   *
   * @param statusCode - The HTTP status code to evaluate
   * @returns The corresponding LogLevel based on the status code:
   * - {@link LogLevel.CRITICAL} for status codes >= 500 (server errors)
   * - {@link LogLevel.ERROR} for status codes >= 400 (client errors)
   * - {@link LogLevel.WARN} for status codes >= 300 (redirects)
   * - {@link LogLevel.INFO} for status codes < 300 (success responses)
   *
   * @example
   * ```typescript
   * getLogLevel(404); // Returns LogLevel.ERROR
   * getLogLevel(500); // Returns LogLevel.CRITICAL
   * getLogLevel(200); // Returns LogLevel.INFO
   * ```
   */
  getLogLevel(statusCode: number): LogLevel {
    if (statusCode >= 500) {
      return LogLevel.CRITICAL;
    } else if (statusCode >= 400) {
      return LogLevel.ERROR;
    } else if (statusCode >= 300) {
      return LogLevel.WARN;
    }
    return LogLevel.INFO;
  }
}
