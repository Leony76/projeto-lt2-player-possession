import { describe, it, expect, vi, beforeEach } from "vitest";

import { RefreshTokenService } from "../refreshToken.service.js";
import { prisma } from "@backend/lib/prisma.js"; 

import { generateRefreshToken,hashRefreshToken } from "@backend/config/jwt.config.js";
import { Prisma } from "@backend/generated/prisma/client.js";

vi.mock("@backend/config/jwt.config.js", () => ({
  generateRefreshToken : vi.fn(),
  hashRefreshToken     : vi.fn(),
}));

vi.mock("@backend/lib/prisma.js", () => ({
  prisma: {
    refreshToken: {
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const mockTransaction = (tx: object) => {
  vi.mocked(prisma.$transaction).mockImplementation(
    async (callback) => {
      return callback(
        tx as Prisma.TransactionClient
      );
    }
  );
}

describe("RefreshTokenService", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe("create", () => {

    it("should create a refresh token with a 7-day expiration", async () => {
      vi.mocked(generateRefreshToken)
        .mockReturnValue("raw_refresh_token");

      vi.mocked(hashRefreshToken)
        .mockReturnValue("hashed_refresh_token");

      vi.mocked(prisma.refreshToken.create)
        .mockResolvedValue({} as never);

      const before = Date.now();

      const result = await RefreshTokenService.create(1);

      const after = Date.now();

      expect(result).toBe("raw_refresh_token");

      expect(hashRefreshToken)
        .toHaveBeenCalledWith("raw_refresh_token");

      const createMock = vi.mocked(prisma.refreshToken.create);

      expect(createMock).toHaveBeenCalledTimes(1);

      const createCall = createMock.mock.calls[0]![0];

      expect(createCall.data.userId).toBe(1);

      expect(createCall.data.tokenHash)
        .toBe("hashed_refresh_token");

      const expiresAt = createCall.data.expiresAt;

      expect(expiresAt).toBeInstanceOf(Date);

      if (!(expiresAt instanceof Date)) {
        throw new Error("expiresAt should be a Date");
      }

      const expiration = expiresAt.getTime();

      const expectedMin = before + 7 * 24 * 60 * 60 * 1000;
      const expectedMax = after + 7 * 24 * 60 * 60 * 1000;

      expect(expiration).toBeGreaterThanOrEqual(expectedMin);
      expect(expiration).toBeLessThanOrEqual(expectedMax);
    });

  });


  describe("rotate", () => {

    const validStoredToken = {
      id: 10,
      userId: 1,
      tokenHash: "old_hash",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
    };


    it("should rotate a valid refresh token", async () => {
      vi.mocked(hashRefreshToken)
        .mockImplementation((token) => `hash_${token}`);

      vi.mocked(generateRefreshToken)
        .mockReturnValue("new_refresh_token");

      const tx = {
        refreshToken: {
          findUnique: vi.fn().mockResolvedValue(validStoredToken),

          updateMany: vi.fn().mockResolvedValue({
            count: 1,
          }),

          create: vi.fn().mockResolvedValue({}),
        },
      };

      mockTransaction(tx);

      const result = await RefreshTokenService.rotate(
        "old_refresh_token",
      );

      expect(result).toEqual({
        userId: 1,
        refreshToken: "new_refresh_token",
      });

      expect(tx.refreshToken.findUnique)
        .toHaveBeenCalledWith({
          where: {
            tokenHash: "hash_old_refresh_token",
          },
        });

      expect(tx.refreshToken.updateMany)
        .toHaveBeenCalledWith({
          where: {
            id: 10,
            revokedAt: null,
          },
          data: {
            revokedAt: expect.any(Date),
          },
        });

      expect(tx.refreshToken.create)
        .toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: 1,
            tokenHash: "hash_new_refresh_token",
            expiresAt: expect.any(Date),
          }),
        });
    });


    it("should return null when token does not exist", async () => {
      const tx = {
        refreshToken: {
          findUnique: vi.fn().mockResolvedValue(null),
          updateMany: vi.fn(),
          create: vi.fn(),
        },
      };

      mockTransaction(tx);

      const result = await RefreshTokenService.rotate("invalid_token");

      expect(result).toBeNull();

      expect(tx.refreshToken.updateMany).not.toHaveBeenCalled();
      expect(tx.refreshToken.create).not.toHaveBeenCalled();
    });


    it("should return null when token is already revoked", async () => {
      const tx = {
        refreshToken: {
          findUnique: vi.fn().mockResolvedValue({
            ...validStoredToken,
            revokedAt: new Date(),
          }),
          updateMany: vi.fn(),
          create: vi.fn(),
        },
      };

      mockTransaction(tx);

      const result = await RefreshTokenService.rotate("revoked_token");

      expect(result).toBeNull();

      expect(tx.refreshToken.updateMany).not.toHaveBeenCalled();
      expect(tx.refreshToken.create).not.toHaveBeenCalled();
    });


    it("should return null when token is expired", async () => {
      const tx = {
        refreshToken: {
          findUnique: vi.fn().mockResolvedValue({
            ...validStoredToken,
            expiresAt: new Date(Date.now() - 1000),
          }),
          updateMany: vi.fn(),
          create: vi.fn(),
        },
      };

      mockTransaction(tx);

      const result = await RefreshTokenService.rotate("expired_token");

      expect(result).toBeNull();

      expect(tx.refreshToken.updateMany).not.toHaveBeenCalled();
      expect(tx.refreshToken.create).not.toHaveBeenCalled();
    });


    it("should return null when another request already revoked the token", async () => {
      const tx = {
        refreshToken: {
          findUnique: vi.fn().mockResolvedValue(validStoredToken),

          updateMany: vi.fn().mockResolvedValue({
            count: 0,
          }),

          create: vi.fn(),
        },
      };

      mockTransaction(tx);

      const result = await RefreshTokenService.rotate("old_token");

      expect(result).toBeNull();

      expect(tx.refreshToken.create).not.toHaveBeenCalled();
    });

  });


  describe("revoke", () => {

    it("should revoke an active refresh token", async () => {
      vi.mocked(hashRefreshToken)
        .mockReturnValue("hashed_token");

      vi.mocked(prisma.refreshToken.updateMany)
        .mockResolvedValue({ count: 1 });

      await RefreshTokenService.revoke("raw_token");

      expect(prisma.refreshToken.updateMany)
        .toHaveBeenCalledWith({
          where: {
            tokenHash: "hashed_token",
            revokedAt: null,
          },
          data: {
            revokedAt: expect.any(Date),
          },
        });
    });
  });
});