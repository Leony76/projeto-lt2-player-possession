import type { Request, Response } from "express";
import { UserService } from "./user.service.js";
import type { SuccessfulOperationResponse } from "@shared/dtos/operationResult.dto.js";
import type { EditProfileImageResponse } from "@shared/dtos/editProfileImage.dto.js";
import type { EditUsernameResponse } from "@shared/dtos/editUsername.dto.js";

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



  public static async verifyUsernameAvailability(
    req: Request, 
    res: Response
  ) {
    const { username } = req.body;
    const userId = req.authUserId;

    const body = await UserService.verifyUsernameAvailability(username, userId);

    const response: SuccessfulOperationResponse<{ username: string }> = {
      success : true,
      body    : body,
      message : 'available',
    }

    return res.status(200).json(response);
  }



  public static async editUsername(
    req: Request, 
    res: Response
  ) {
    const { username } = req.body;
    const userId = req.authUserId;

    const body = await UserService.editUsername(username, userId);

    const response: SuccessfulOperationResponse<EditUsernameResponse> = {
      success : true,
      body    : body,
      message : 'Username successfuly updated',
    }

    return res.status(200).json(response);
  }
} 