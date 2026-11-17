import { generateRefreshToken, hashRefreshToken } from "@backend/config/jwt.config.js";
import { prisma } from "@backend/lib/prisma.js";


const REFRESH_TOKEN_EXPIRATION_DAYS = 7;

export class RefreshTokenService {

  public static async create(
    userId : number
  ) {

    const token = generateRefreshToken();
    const tokenHash = hashRefreshToken(token);

    const expiresAt = new Date();

    expiresAt.setDate(
      expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS
    );

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return token;
  }



  public static async rotate(
    token: string
  ) {

    const tokenHash = hashRefreshToken(token);

    const newToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newToken);

    const result = await prisma.$transaction(async (tx) => {

      const storedToken = await tx.refreshToken.findUnique({
        where: {
          tokenHash,
        },
      });

      if (
        !storedToken ||
        storedToken.revokedAt ||
        storedToken.expiresAt <= new Date()
      ) {
        return null;
      }

      const revoked = await tx.refreshToken.updateMany({
        where: {
          id: storedToken.id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      if (revoked.count !== 1) {
        return null;
      }

      const expiresAt = new Date();

      expiresAt.setDate(
        expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS
      );

      await tx.refreshToken.create({
        data: {
          userId: storedToken.userId,
          tokenHash: newTokenHash,
          expiresAt,
        },
      });

      return {
        userId       : storedToken.userId,
        refreshToken : newToken,
      };
    });

    return result;
  }



  public static async revoke(
    token : string
  ) {

    const tokenHash = hashRefreshToken(token);

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}