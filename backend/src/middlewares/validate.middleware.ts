import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = schema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success : false,
        message : "Validation failed.",
        errors  : validation.error.flatten().fieldErrors,
      });
    }

    req.body = validation.data;

    return next();
  };
};