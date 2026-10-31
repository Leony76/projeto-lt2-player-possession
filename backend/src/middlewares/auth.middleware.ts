import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env["JWT_SECRET"]!;

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.["access_token"];

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload === "number" 
      ||
      typeof payload.sub !== "number"
    ) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }

    req.authUserId = payload.sub;

    return next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired session",
    });
  }
}