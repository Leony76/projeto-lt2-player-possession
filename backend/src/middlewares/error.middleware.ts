import type { Request, Response, NextFunction } from "express";

export class AuthError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error && err.name === "ZodError") {
    return res.status(400).json({
      message: "Invalid data",
    });
  }

  const statusCode =
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    typeof err.statusCode === "number"
      ? err.statusCode
      : 500;

  const message =
    statusCode < 500 && err instanceof Error
      ? err.message
      : "Internal server error";

  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json({ message });
};