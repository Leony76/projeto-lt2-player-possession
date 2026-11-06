import type { SuccessfulOperationResponse } from "@shared/dtos/operationResult.dto";
import { api } from "@/lib/api";
import type { EditProfileImageRequest, EditProfileImageResponse } from "@shared/dtos/editProfileImage.dto";
import type { EditUsernameRequest, EditUsernameResponse } from "@shared/dtos/editUsername.dto";
import type { EditLumberBucksRequest, EditLumberBucksResponse } from "@shared/dtos/editLumberBucks.dto";
import type { EditPasswordRequest, EditPasswordResponse, PasswordVerificationRequest, PasswordVerificationResponse } from "@shared/dtos/editPassword.dto";

export class UserService {

  public static async editProfileImage(
    request: Pick<EditProfileImageRequest, 'file' | 'imageURL'>
  ): Promise<SuccessfulOperationResponse<EditProfileImageResponse>> {
    const formData = new FormData();
    
    if (request.file) {
      formData.append("image", request.file);
    } else if (request.imageURL) {
      formData.append("imageURL", request.imageURL);
    }

    const { data } = await api.patch<
      SuccessfulOperationResponse<
        EditProfileImageResponse>>(
          "/user/profile/update-image", 
          formData
        );

    return data;
  }



  public static async verifyUsernameAvailability(
    request: { username: string }
  ): Promise<SuccessfulOperationResponse<{ username: string }>> {
    const { data } = await api.post<
      SuccessfulOperationResponse<
        { username: string }>>(
          "/user/profile/edit-username/verify-availability",
          request
        );
      
    return data;
  }



  public static async editUsername(
    request : EditUsernameRequest
  ): Promise<SuccessfulOperationResponse<EditUsernameResponse>> {
    const { data } = await api.patch<
      SuccessfulOperationResponse<
        EditUsernameResponse>>(
          "/user/profile/edit-username",
          request
        );
      
    return data;
  }



  public static async editLumberBucks(
    request : EditLumberBucksRequest
  ): Promise<SuccessfulOperationResponse<EditLumberBucksResponse>> {
    const { data } = await api.patch<
      SuccessfulOperationResponse<
        EditLumberBucksResponse>>(
          "/user/profile/edit-lumber-bucks",
          request
        );
      
    return data;
  }



  public static async passwordVerificationBeforeEdit(
    request : PasswordVerificationRequest
  ): Promise<SuccessfulOperationResponse<PasswordVerificationResponse>> {
    const { data } = await api.post<
      SuccessfulOperationResponse<
        PasswordVerificationResponse>>(
          "/user/profile/edit-password/verification",
          request
        );
      
    return data;
  }



  public static async editPassword(
    request : EditPasswordRequest
  ): Promise<SuccessfulOperationResponse<EditPasswordResponse>> {
    const { data } = await api.patch<
      SuccessfulOperationResponse<
        EditPasswordResponse>>(
          "/user/profile/edit-password",
          request
        );
      
    return data;
  }
}