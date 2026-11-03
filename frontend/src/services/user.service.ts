import type { SuccessfulOperationResponse } from "@shared/dtos/operationResult.dto";
import { api } from "@/lib/api";
import type { EditProfileImageRequest, EditProfileImageResponse } from "@shared/dtos/editProfileImage.dto";

export class UserService {

  public static async editProfileImage(
    request: Pick<EditProfileImageRequest, 'file' | 'imageURL'>
  ) {
    const formData = new FormData();
    
    if (request.file) {
      formData.append("image", request.file);
    } else if (request.imageURL) {
      formData.append("imageURL", request.imageURL);
    }

    const { data } = await api.patch<
      SuccessfulOperationResponse<
        EditProfileImageResponse>>(
          "/user/profile/update-image", formData
        );

    return data;
  }
}