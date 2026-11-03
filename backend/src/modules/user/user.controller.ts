import type { Request, Response } from "express";
import { UserService } from "./user.service.js";
import type { SuccessfulOperationResponse } from "@shared/dtos/operationResult.dto.js";
import type { EditProfileImageResponse } from "@shared/dtos/editProfileImage.dto.js";

export class UserController {

  public static async editProfileImage(
    req: Request, 
    res: Response
  ) {
    const userId = req.authUserId;
    const file = req.file;
    const imageURL = req.body.imageURL;

    const body = await UserService.editProfileImage(userId, file, imageURL);

    const response: SuccessfulOperationResponse<EditProfileImageResponse> = {
      success : true,
      body    : body,
      message : 'Profile image successfuly updated',
    }

    return res.status(200).json(response);
  }
} 