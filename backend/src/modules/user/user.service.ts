import type { EditProfileImageResponse } from "@shared/dtos/editProfileImage.dto.js";
import { APIError } from "../../middlewares/error.middleware.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { UserRepository } from "./user.repository.js";
import type { EditUsernameResponse } from "@shared/dtos/editUsername.dto.js";
import type { EditLumberBucksResponse } from "@shared/dtos/editLumberBucks.dto.js";
import type { EditPasswordResponse, PasswordVerificationResponse } from "@shared/dtos/editPassword.dto.js";
import { AuthRepository } from "../auth/auth.repository.js";
import argon2 from "argon2";

export class UserService {
  
  public static async editProfileImage(
    userId    : number | undefined, 
    file     ?: Express.Multer.File | undefined,
    imageURL ?: string
  ): Promise<EditProfileImageResponse> {
    if (!userId) {
      throw new APIError(401, "User not authenticated");
    } 

    if (!file && !imageURL) {
      throw new APIError(400, "No image was provided");
    }

    let url: string;

    if (file) {
      url = (await CloudinaryService.uploadProfileImage(
        file,
        userId
      )).url;
    } else if (imageURL) {
      url = imageURL;
    } else {
      throw new APIError(400, "No image was provided");
    }

    const updatedUser = await UserRepository.editProfileImage(userId, url);

    return updatedUser;
  }



  public static async verifyUsernameAvailability(
    username : string,
    userId   : number | undefined,
  ): Promise<{ username: string }> {
    if (!userId) {
      throw new APIError(401, "User not authenticated");
    }  if (!username) {
      throw new APIError(400, "No username was provided");
    }

    const alreadyTaken = await UserRepository.verifyUsernameAvailability(username);

    if (alreadyTaken) {
      throw new APIError(409, "Username already taken");
    }

    return { username };
  }



  public static async editUsername(
    username : string,
    userId   : number | undefined,
  ): Promise<EditUsernameResponse> {
    if (!userId) {
      throw new APIError(401, "User not authenticated");
    }  if (!username) {
      throw new APIError(400, "No username was provided");
    }

    const alreadyTaken = await UserRepository.verifyUsernameAvailability(username);

    if (alreadyTaken) {
      throw new APIError(409, "Username already taken");
    }

    const result = await UserRepository.editUsername(username, userId);

    return { 
      userId   : result.id,
      username : result.name,
    };
  }



  public static async editLumberBucks(
    lumberBucks : number,
    userId      : number | undefined,
  ): Promise<EditLumberBucksResponse> {
    if (!userId) {
      throw new APIError(401, "User not authenticated");
    }  if (!lumberBucks) {
      throw new APIError(400, "No lumber bucks amount was provided");
    }

    const newAmountOf = await UserRepository.editLumberBucks(lumberBucks, userId);

    return { lumberBucks: newAmountOf.lumberBucks };
  }



  public static async passwordVerificationBeforeEdit(
    password : string,
    userId   : number | undefined,
  ): Promise<PasswordVerificationResponse> {
    if (!userId) {
      throw new APIError(401, "User not authenticated");
    }  if (!password) {
      throw new APIError(400, "No password was provided");
    }

    const passwordHash = (await AuthRepository.findUserById(userId))?.passwordHash;

    if (!passwordHash) {
      throw new APIError(500, 'Unable to do password verification');
    }

    const result = await argon2.verify(passwordHash, password);  

    return { success: result };
  }



  public static async editPassword(
    newPassword : string,
    userId      : number | undefined,
  ): Promise<EditPasswordResponse> {
    if (!userId) {
      throw new APIError(401, "User not authenticated");
    }  if (!newPassword) {
      throw new APIError(400, "No password was provided");
    }

    const passwordHash = await argon2.hash(newPassword);

    const result = await UserRepository.editPassword(passwordHash, userId);

    return { success: !!result.id };
  }
}