import argon2 from "argon2";
import { Prisma } from "../../generated/prisma/client.js";
import { AuthRepository } from "./auth.repository.js";
import { AuthMapper } from "./auth.mappers.js"; 
import { assertJWTSecretIsConfigured, generateToken } from "../../config/jwt.js";
import { AuthError } from "../../middlewares/error.middleware.js";

assertJWTSecretIsConfigured();

export class AuthService {
  
  public static async signUp(username: string, password: string) {
    const nameAlreadyTaken = await AuthRepository.userExistsByName(username);

    if (nameAlreadyTaken) {
      throw new AuthError(409, "Name Already Taken!")
    }   

    const passwordHash = await argon2.hash(password);

    try {
      const user = await AuthRepository.create(
        username,
        passwordHash,
      );

      return AuthMapper.toPublicUser(user);
    } catch (error:unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AuthError(409, "Name Already Taken!");
      }

      throw error;
    }
  }



  public static async signIn(username: string, password: string) {
    const user = await AuthRepository.findUserByName(username);

    if (
      !user 
      ||
      !(await argon2.verify(user.passwordHash, password))
    ) {
      throw new AuthError(401, "Invalid Credentials");
    }

    const token = generateToken(user.id);

    return {
      user: AuthMapper.toPublicUser(user),
      token,
    }
  }


  
  public static async getLoggedUser(userId: number) {
    const user = await AuthRepository.findUserById(userId);

    if (!user) {
      throw new AuthError(401, 'User not found');
    }

    return AuthMapper.toPublicUser(user);
  }
}