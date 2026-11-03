import type { EditProfileImageResponse } from "@shared/dtos/editProfileImage.dto.js";
import { APIError } from "../../middlewares/error.middleware.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { UserRepository } from "./user.repository.js";
import type { EditUsernameResponse } from "@shared/dtos/editUsername.dto.js";

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
}