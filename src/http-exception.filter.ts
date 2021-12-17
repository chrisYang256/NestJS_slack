import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const err = exception.getResponse() as 
      { message: any; statusCode: number }
      | { error: string; statusCode: 400; message: string[] }; // class-validator 에러 내용

		// 원하는데로 formatting할 수 있음.
    response 
      .status(status)
      .json({
        success: false,
        code: status,
        data: err.message,
        timestamp: new Date().toISOString(),
      });
  }
}