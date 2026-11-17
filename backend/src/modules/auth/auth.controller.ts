import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../../config/cookies.config.js";
import { RefreshTokenService } from "./refreshToken.service.js";
import { generateToken } from "@backend/config/jwt.config.js";

export class AuthController {
  
  public static async signUp(
    req  : Request, 
    res  : Response, 
  ) {
    const data = req.body;

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
    const data = req.body;

    const result = await AuthService.signIn(
      data.username,
      data.password,
    );

    const accessToken = generateToken(result.user.id);

    const refreshToken = await RefreshTokenService.create(
      result.user.id,
    );

    res.cookie(
      "access_token",
      accessToken,
      accessTokenCookieOptions,
    );

    res.cookie(
      "refresh_token",
      refreshToken,
      refreshTokenCookieOptions,
    );

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



  static async signOut(
    req : Request, 
    res : Response
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
      await RefreshTokenService.revoke(refreshToken);
    }

    res.clearCookie("access_token", {
      ...accessTokenCookieOptions,
      maxAge: undefined,
    });

    res.clearCookie("refresh_token", {
      ...refreshTokenCookieOptions,
      maxAge: undefined,
    });

    return res.status(200).json({
      message: "Signed out successfully",
    });
  }



  static async refresh(
    req : Request, 
    res : Response
  ) {
    const refreshToken = req.cookies?.["refresh_token"];

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found",
      });
    }

    const result = await RefreshTokenService.rotate(refreshToken);

    if (!result) {
      res.clearCookie("access_token", {
        ...accessTokenCookieOptions,
        maxAge: undefined,
      });

      res.clearCookie("refresh_token", {
        ...refreshTokenCookieOptions,
        maxAge: undefined,
      });

      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    const accessToken = generateToken(result.userId);

    res.cookie(
      "access_token",
      accessToken,
      accessTokenCookieOptions,
    );

    res.cookie(
      "refresh_token",
      result.refreshToken,
      refreshTokenCookieOptions,
    );

    return res.status(200).json({
      message: "Session renewed",
    });
  }
}