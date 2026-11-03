import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { authSchema } from "./auth.schema.js";
import { cookieOptions } from "../../config/cookies.config.js";

export class AuthController {
  
  public static async signUp(
    req  : Request, 
    res  : Response, 
  ) {
    const data = authSchema.parse(req.body);

    const user = await AuthService.signUp(
      data.username,
      data.password,
    );

    return res.status(201).json({ user });
  }



  public static async signIn(
    req  : Request, 
    res  : Response, 
  ) {
    const data = authSchema.parse(req.body);

    const result = await AuthService.signIn(
      data.username,
      data.password,
    );

    res.cookie("access_token", result.token, cookieOptions);

    return res.status(200).json({
      user: result.user,
    });
  }



  public static async me(
    req  : Request, 
    res  : Response, 
  ) {
    if (!req.authUserId) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const user = await AuthService.getLoggedUser(
      req.authUserId,
    );

    return res.status(200).json({ user });
  }



  public static async signOut(
    req: Request, 
    res: Response
  ) {
    res.clearCookie("access_token", {
      httpOnly  : true,
      secure    : process.env["NODE_ENV"] === "production",
      sameSite  : "lax",
      path      : "/",
    });

    return res.sendStatus(204);
  }
}