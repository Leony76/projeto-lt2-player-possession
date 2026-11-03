import { Readable } from "node:stream";
import cloudinary from "../../config/cloudinary.config.js";
import type { UploadImage } from "../../types/uploadImage.type.js";

export class CloudinaryService {

  public static async uploadProfileImage(
    file   : Express.Multer.File, 
    userId : number
  ): Promise<UploadImage> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder         : "lt2-players-possession-users-profile-images",
          public_id      : `user-${userId}-${Date.now()}`,
          resource_type  : "image",
          // transformation : [
          //   {
          //     width   : 512,
          //     height  : 512,
          //     crop    : "fill",
          //     gravity : "auto",
          //   },
          // ],
        },
        (error, result) => {
          if (error) return reject(error);

          if (!result) {
            return reject(
              new Error("Cloudinary did not return the upload result."),
            );
          }

          resolve({
            url      : result.secure_url,
            publicId : result.public_id,
          });
        },
      );

      Readable.from(file.buffer).pipe(stream);
    });
  }
}