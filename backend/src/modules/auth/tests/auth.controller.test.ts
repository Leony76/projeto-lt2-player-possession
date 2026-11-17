import { describe, it, expect, vi, beforeEach } from "vitest";

import { AuthController } from "../auth.controller.js";
import { AuthService } from "../auth.service.js";
import { RefreshTokenService } from "../refreshToken.service.js";

import { generateToken } from "../../../config/jwt.config.js";

import type { Request, Response } from "express";

vi.mock("../auth.service.js", () => ({
  AuthService: {
    signUp        : vi.fn(),
    signIn        : vi.fn(),
    getLoggedUser : vi.fn(),
  },
}));

vi.mock("../refreshToken.service.js", () => ({
  RefreshTokenService: {
    create: vi.fn(),
    rotate: vi.fn(),
    revoke: vi.fn(),
  },
}));

vi.mock("../../../config/jwt.config.js", () => ({
  generateToken: vi.fn(),
}));

describe("AuthController", () => {

  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      body: {},
      cookies: {},
    };

    res = {
      status      : vi.fn().mockReturnThis(),
      json        : vi.fn().mockReturnThis(),
      cookie      : vi.fn().mockReturnThis(),
      clearCookie : vi.fn().mockReturnThis(),
    };
  });


  describe("signUp", () => {

    it("should return 201 when user is created", async () => {
      req.body = {
        username: "Player123",
        password: "password123",
      };

      vi.mocked(AuthService.signUp)
        .mockResolvedValue({
          id: 1,
          name: "Player123",
          lumberBucks: 0,
          profileImageURL: null,
        });

      await AuthController.signUp(
        req as Request,
        res as Response,
      );

      expect(AuthService.signUp)
        .toHaveBeenCalledWith("Player123", "password123");

      expect(res.status).toHaveBeenCalledWith(201);
    });

  });


  describe("signIn", () => {

    it("should authenticate and set authentication cookies", async () => {
      req.body = {
        username: "Player123",
        password: "password123",
      };

      vi.mocked(AuthService.signIn)
        .mockResolvedValue({
          userId: 1,
          user: {
            id: 1,
            name: "Player123",
            lumberBucks: 0,
            profileImageURL: null,
          },
        });

      vi.mocked(generateToken)
        .mockReturnValue("access_token");

      vi.mocked(RefreshTokenService.create)
        .mockResolvedValue("refresh_token");

      await AuthController.signIn(
        req as Request,
        res as Response,
      );

      expect(generateToken).toHaveBeenCalledWith(1);

      expect(RefreshTokenService.create).toHaveBeenCalledWith(1);

      expect(res.cookie).toHaveBeenCalledTimes(2);

      expect(res.status).toHaveBeenCalledWith(200);
    });

  });


  describe("me", () => {

    it("should return 401 when user is not authenticated", async () => {
      delete req.authUserId;

      await AuthController.me(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(401);

      expect(AuthService.getLoggedUser).not.toHaveBeenCalled();
    });


    it("should return the logged user", async () => {
      req.authUserId = 1;

      vi.mocked(AuthService.getLoggedUser)
        .mockResolvedValue({
          id: 1,
          name: "Player123",
          lumberBucks: 0,
          profileImageURL: null,
        });

      await AuthController.me(
        req as Request,
        res as Response,
      );

      expect(AuthService.getLoggedUser).toHaveBeenCalledWith(1);

      expect(res.status).toHaveBeenCalledWith(200);
    });

  });


  describe("signOut", () => {

    it("should revoke the refresh token and clear cookies", async () => {
      req.cookies = {
        refresh_token: "refresh_token",
      };

      vi.mocked(RefreshTokenService.revoke)
        .mockResolvedValue(undefined);

      await AuthController.signOut(
        req as Request,
        res as Response,
      );

      expect(RefreshTokenService.revoke)
        .toHaveBeenCalledWith("refresh_token");

      expect(res.clearCookie).toHaveBeenCalledTimes(2);

      expect(res.status).toHaveBeenCalledWith(200);
    });


    it("should clear cookies even without refresh token", async () => {
      req.cookies = {};

      await AuthController.signOut(
        req as Request,
        res as Response,
      );

      expect(RefreshTokenService.revoke).not.toHaveBeenCalled();

      expect(res.clearCookie).toHaveBeenCalledTimes(2);
    });

  });


  describe("refresh", () => {

    it("should return 401 when refresh token is missing", async () => {
      req.cookies = {};

      await AuthController.refresh(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(401);

      expect(RefreshTokenService.rotate).not.toHaveBeenCalled();
    });


    it("should return 401 when refresh token is invalid", async () => {
      req.cookies = {
        refresh_token: "invalid_token",
      };

      vi.mocked(RefreshTokenService.rotate)
        .mockResolvedValue(null);

      await AuthController.refresh(
        req as Request,
        res as Response,
      );

      expect(res.clearCookie).toHaveBeenCalledTimes(2);

      expect(res.status).toHaveBeenCalledWith(401);
    });


    it("should renew the session with a valid refresh token", async () => {
      req.cookies = {
        refresh_token: "old_refresh_token",
      };

      vi.mocked(RefreshTokenService.rotate)
        .mockResolvedValue({
          userId: 1,
          refreshToken: "new_refresh_token",
        });

      vi.mocked(generateToken)
        .mockReturnValue("new_access_token");

      await AuthController.refresh(
        req as Request,
        res as Response,
      );

      expect(RefreshTokenService.rotate)
        .toHaveBeenCalledWith("old_refresh_token");

      expect(generateToken).toHaveBeenCalledWith(1);

      expect(res.cookie).toHaveBeenCalledTimes(2);

      expect(res.status).toHaveBeenCalledWith(200);
    });

  });

});