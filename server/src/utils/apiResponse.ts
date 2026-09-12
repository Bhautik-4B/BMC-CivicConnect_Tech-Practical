import { Response } from 'express';
import { ApiResponse } from '@bmc/shared';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): Response {
  const responsePayload: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta
  };
  return res.status(statusCode).json(responsePayload);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response {
  return sendSuccess(res, data, message, 201);
}
