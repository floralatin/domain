import { NextFunction, Request, Response } from "express";
import { ApplicationError } from "../helpers/application.err";
import { logger } from "../utils/logger";

export const errorHandler = async (
  error: ApplicationError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status: number = error.status || 500;
  const message: string = error.message || "Something went wrong";
  logger.error(
    `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}, Error: ${error}`
  );
  res.status(status).json({ status, message });
};
