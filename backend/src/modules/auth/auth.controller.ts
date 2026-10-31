import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import { authSchema } from "./auth.schema.js";
import { cookieOptions } from "../../config/cookies.js";

export class AuthController {
  
  public static async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const data = authSchema.parse(req.body);

      const user = await AuthService.signUp(
        data.username,
        data.password,
      );

      return res.status(201).json({ user });
    } catch (error:unknown) { 
      return next(error);
    }
  }



  public static async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const data = authSchema.parse(req.body);

      const result = await AuthService.signIn(
        data.username,
        data.password,
      );

      res.cookie("access_token", result.token, cookieOptions);

      return res.status(200).json({
        user: result.user,
      });
    } catch (error) {
      return next(error);
    }
  }



  public static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.authUserId) {
        return res.status(401).json({
          message: "Not authenticated",
        });
      }

      const user = await AuthService.getLoggedUser(
        req.authUserId,
      );

      return res.status(200).json({ user });
    } catch (error) {
      return next(error);
    }
  }



  public static async signOut(req: Request, res: Response) {
    res.clearCookie("access_token", {
      httpOnly  : true,
      secure    : process.env["NODE_ENV"] === "production",
      sameSite  : "lax",
      path      : "/",
    });

    return res.sendStatus(204);
  }
}