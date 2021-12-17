import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const err = exception.getResponse() as string | { error: string; statusCode: 400; message: string[] };

    console.log(err, status)

    response
      .status(status)
      .json({
        statusCode: status,
        message: err,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
  }
}