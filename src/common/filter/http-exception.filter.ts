import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import { Response } from "express";
import { errorResponse } from "../utils/response.util";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

  catch(exception: unknown, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let message: string | string[];
    let errorData: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null && "message" in res) {
        message = res?.message as string;
        errorData = res;
      } else {
        message = "An error occurred";
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Internal server error";
    }

    const errorPayload = errorResponse(errorData, message);

    response.status(status).json(errorPayload);
  }
}


// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpException,
//   HttpStatus,
//   Logger,
// } from '@nestjs/common';
// import { Request, Response } from 'express';

// @Catch()
// export class GlobalExceptionFilter implements ExceptionFilter {
//   private logger = Logger.log(GlobalExceptionFilter.name);
//   catch(exception: unknown, host: ArgumentsHost) {
//     console.log(exception);

//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     const status =
//       exception instanceof HttpException
//         ? exception.getStatus()
//         : HttpStatus.INTERNAL_SERVER_ERROR;

//     const message =
//       exception instanceof HttpException
//         ? exception.getResponse()
//         : 'Internal server error';

//     response.status(status).json({
//       statusCode: status,
//       success: false,
//       message:
//         typeof message === 'string'
//           ? message
//           : (message as any).message || message,
//       path: request.url,
//     });
//   }
// }