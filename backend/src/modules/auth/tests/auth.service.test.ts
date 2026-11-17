vi.mock("../../../config/jwt.config.js", () => ({
  assertJWTSecretIsConfigured: vi.fn(),
}));

import { describe, it, expect, vi, beforeEach } from "vitest";

import { AuthService } from "../auth.service.js";
import { AuthRepository } from "../auth.repository.js";
import argon2 from "argon2";
import { APIError } from "../../../middlewares/error.middleware.js";

vi.mock("../auth.repository.js", () => ({
  AuthRepository: {
    userExistsByName : vi.fn(),
    create           : vi.fn(),
    findUserByName   : vi.fn(),
    findUserById     : vi.fn(),
  },
}));

vi.mock("argon2", () => ({
  default: {
    hash   : vi.fn(),
    verify : vi.fn(),
  },
}));

describe("AuthService", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe("signUp", () => {

    it("should create a new user", async () => {
      vi.mocked(AuthRepository.userExistsByName)
        .mockResolvedValue(false);

      vi.mocked(argon2.hash)
        .mockResolvedValue("hashed_password" as never);

      vi.mocked(AuthRepository.create)
        .mockResolvedValue({
          id              : 1,
          name            : "Player123",
          lumberBucks     : 0,
          profileImageURL : null,
        });

      const result = await AuthService.signUp(
        "Player123",
        "password123",
      );

      expect(result).toEqual({
        id              : 1,
        name            : "Player123",
        lumberBucks     : 0,
        profileImageURL : null,
      });

      expect(AuthRepository.userExistsByName)
        .toHaveBeenCalledWith("Player123");

      expect(argon2.hash)
        .toHaveBeenCalledWith("password123");

      expect(AuthRepository.create)
        .toHaveBeenCalledWith(
          "Player123",
          "hashed_password",
        );
    });


    it("should throw an error if username already exists", async () => {
      vi.mocked(AuthRepository.userExistsByName)
        .mockResolvedValue(true);

      await expect(
        AuthService.signUp("Player123", "password123")
      ).rejects.toThrow(APIError);

      expect(argon2.hash).not.toHaveBeenCalled();

      expect(AuthRepository.create).not.toHaveBeenCalled();
    });

  });


  describe("signIn", () => {

    it("should authenticate a user with valid credentials", async () => {
      vi.mocked(AuthRepository.findUserByName)
        .mockResolvedValue({
          id              : 1,
          name            : "Player123",
          passwordHash    : "hashed_password",
          lumberBucks     : 0,
          profileImageURL : null,
        } as never)
      ;

      vi.mocked(argon2.verify)
        .mockResolvedValue(true);

      const result = await AuthService.signIn(
        "Player123",
        "password123",
      );

      expect(result).toEqual({
        user: {
          id              : 1,
          name            : "Player123",
          lumberBucks     : 0,
          profileImageURL : null,
        },
        userId: 1,
      });
    });


    it("should reject invalid credentials", async () => {
      vi.mocked(AuthRepository.findUserByName)
        .mockResolvedValue(null);

      await expect(
        AuthService.signIn("Unknown", "password123")
      ).rejects.toThrow(APIError);

      expect(argon2.verify).not.toHaveBeenCalled();
    });


    it("should reject an incorrect password", async () => {
      vi.mocked(AuthRepository.findUserByName)
        .mockResolvedValue({
          id              : 1,
          name            : "Player123",
          passwordHash    : "hashed_password",
          lumberBucks     : 0,
          profileImageURL : null,
        } as never);

      vi.mocked(argon2.verify)
        .mockResolvedValue(false);

      await expect(
        AuthService.signIn("Player123", "wrong_password")
      ).rejects.toThrow(APIError);
    });
  });


  describe("getLoggedUser", () => {

    it("should return the authenticated user", async () => {
      vi.mocked(AuthRepository.findUserById)
        .mockResolvedValue({
          id              : 1,
          name            : "Player123",
          passwordHash    : "hashed_password",
          lumberBucks     : 0,
          profileImageURL : null,
        } as never);

      const result = await AuthService.getLoggedUser(1);

      expect(result).toEqual({
        id: 1,
        name: "Player123",
        lumberBucks: 0,
        profileImageURL: null,
      });
    });


    it("should throw an error if user does not exist", async () => {
      vi.mocked(AuthRepository.findUserById)
        .mockResolvedValue(null);

      await expect(
        AuthService.getLoggedUser(999)
      ).rejects.toThrow(APIError);
    });
  });
});