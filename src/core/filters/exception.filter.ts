import { SystemLogService } from '@core/services';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { appendFile } from 'fs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    @Inject(SystemLogService)
    private readonly _systemLogService: SystemLogService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const date = new Date();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMsg =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception['message'] ||
          exception['response'] ||
          exception ||
          'Critical error in server';

    const errorResponse = {
      statusCode: status,
      message:
        status === 500
          ? `An error occurred on the server, please contact the administrator. Error: #${request['X-Request-Id']}`
          : errorMsg.message || errorMsg,
      timestamp: date.toLocaleString(),
      requestId: request['X-Request-Id'],
      path: request.url,
      method: request.method,
    };

    const errorLog = `Response Code: ${errorResponse.statusCode} - Method: ${
      errorResponse.method
    } - Path: ${errorResponse.path} - Message: ${JSON.stringify(
      errorMsg,
    )} - Timestamp: ${errorResponse.timestamp} - requestId: ${
      errorResponse.requestId
    }`;

    // Determinar nivel de severidad
    const logLevel = this._systemLogService.getLogLevel(status);

    // Log en consola
    this.logger.error(errorLog);

    // Guardar en archivo (backup)
    appendFile(`logs/error.log`, `${errorLog}\n`, 'utf8', (err) => {
      if (err) this.logger.error('Failed to write to log file', err);
    });

    // Guardar en base de datos (async, no bloqueante)
    this._systemLogService
      .saveToDatabase(errorLog, logLevel, request, exception)
      .catch((err) => this.logger.error('Failed to save log to database', err));

    response.status(status).json(errorResponse);
  }
}
