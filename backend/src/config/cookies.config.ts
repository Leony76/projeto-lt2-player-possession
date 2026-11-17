import type { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const cookieOptions : CookieOptions = {
  httpOnly : true,
  secure   : isProduction,
  sameSite : "lax",
  path     : "/",
  maxAge   : 1000 * 60 * 60 * 24,
};



export const accessTokenCookieOptions : CookieOptions = {
  httpOnly : true,
  secure   : isProduction,
  sameSite : "lax",
  path     : "/",
  maxAge   : 1000 * 60 * 15,
};



export const refreshTokenCookieOptions : CookieOptions = {
  httpOnly : true,
  secure   : isProduction,
  sameSite : "lax",
  path     : "/api/auth",
  maxAge   : 1000 * 60 * 60 * 24 * 7,
};