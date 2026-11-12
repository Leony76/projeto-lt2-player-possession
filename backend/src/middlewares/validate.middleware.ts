import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

type ValidationSource = "body" | "query" | "params";

export const validate = (
  schema: ZodType,
  source: ValidationSource = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {

    const validation = schema.safeParse(req[source]);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    if (source === "body") {
      req.body = validation.data;
    } else {
      res.locals["validatedData"] = validation.data;
    }

    return next();
  };
};