
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { assertJWTSecretIsConfigured } from "../config/jwt.config.js";

assertJWTSecretIsConfigured();

const jwtSecret = process.env.JWT_SECRET!;

export const requireAuth = (
  req  : Request,
  res  : Response,
  next : NextFunction
) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({
      code    : "ACCESS_TOKEN_MISSING",
      message : "Access token not found",
    });
  }

  try {
    const payload = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload === "string" ||
      typeof payload === "number" ||
      typeof payload.sub !== "number"
    ) {
      return res.status(401).json({
        code    : "INVALID_ACCESS_TOKEN",
        message : "Invalid access token",
      });
    }

    req.authUserId = payload.sub;

    return next();

  } catch (error: unknown) {

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        code    : "ACCESS_TOKEN_EXPIRED",
        message : "Access token expired",
      });
    }

    return res.status(401).json({
      code    : "INVALID_ACCESS_TOKEN",
      message : "Invalid access token",
    });
  }
};
