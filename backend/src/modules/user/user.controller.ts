import type { Request, Response } from "express";
import { UserService } from "./user.service.js";
import type { SuccessfulOperationResponse } from "@shared/dtos/operationResult.dto.js";
import type { EditProfileImageResponse } from "@shared/dtos/editProfileImage.dto.js";
import type { EditUsernameResponse } from "@shared/dtos/editUsername.dto.js";
import type { EditLumberBucksResponse } from "@shared/dtos/editLumberBucks.dto.js";
import type { EditPasswordResponse, PasswordVerificationResponse } from "@shared/dtos/editPassword.dto.js";

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



  public static async editLumberBucks(
    req: Request, 
    res: Response
  ) {
    const { lumberBucks } = req.body;
    const userId = req.authUserId;

    const body = await UserService.editLumberBucks(lumberBucks, userId);

    const response: SuccessfulOperationResponse<EditLumberBucksResponse> = {
      success : true,
      body    : body,
      message : 'Lumber bucks successfuly updated',
    }

    return res.status(200).json(response);
  }



  public static async passwordVerificationBeforeEdit(
    req: Request, 
    res: Response
  ) {
    const { password } = req.body;
    const userId = req.authUserId;

    const body = await UserService.passwordVerificationBeforeEdit(password, userId);

    const response: SuccessfulOperationResponse<PasswordVerificationResponse> = {
      success : true,
      body    : body,
      message : 'verified',
    }

    return res.status(200).json(response);
  }



  public static async editPassword(
    req: Request, 
    res: Response
  ) {
    const { newPassword } = req.body;
    const userId = req.authUserId;

    const body = await UserService.editPassword(newPassword, userId);

    const response: SuccessfulOperationResponse<EditPasswordResponse> = {
      success : true,
      body    : body,
      message : 'Password successfuly updated',
    }

    return res.status(200).json(response);
  }
} 