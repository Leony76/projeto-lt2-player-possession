import type { EditProfileImageResponse } from "@shared/dtos/editProfileImage.dto.js";
import { APIError } from "../../middlewares/error.middleware.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { UserRepository } from "./user.repository.js";

export class UserService {
  
  public static async editProfileImage(
    userId    : number | undefined, 
    file     ?: Express.Multer.File | undefined,
    imageURL ?: string
  ): Promise<EditProfileImageResponse> {
    if (!userId) {
      throw new APIError(401, "User not authenticated.");
    } 

    if (!file && !imageURL) {
      throw new APIError(400, "No image was provided.");
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
      throw new APIError(400, "No image was provided.");
    }

    const updatedUser = await UserRepository.editProfileImage(userId, url);

    return updatedUser;
  }
}