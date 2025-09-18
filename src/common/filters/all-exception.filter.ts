import { ApiResponseError } from '@/common/helper/base_response';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import mongoose from 'mongoose';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    // HttpException (BadRequest, NotFound, Unauthorized, ...)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && (res as any).message) {
        message = (res as any).message;
      }
    }

    // Mongo duplicate key error
    else if (exception instanceof MongoError && (exception as any).code === 11000) {
      status = HttpStatus.BAD_REQUEST;
      const field = Object.keys((exception as any).keyValue || {})[0];
      message = `The ${field} already exists`;
    }

    // Mongoose validation error
    else if (exception instanceof mongoose.Error.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = Object.values(exception.errors).map((err) => err.message);
    }

    // Mongoose cast error (invalid ObjectId)
    else if (exception instanceof mongoose.Error.CastError) {
      status = HttpStatus.BAD_REQUEST;
      message = `Invalid value for field ${exception.path}`;
    }

    // Log lỗi (chỉ log server side, không leak ra client)
    this.logger.error(
      `❌ ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    // Format response chuẩn
    return response.status(status).json(
      ApiResponseError(message, status, {
        path: request.url,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}
