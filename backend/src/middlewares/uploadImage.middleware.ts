
import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; 

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const uploadImage = multer({
  storage:  multer.memoryStorage(),
  limits  : {
    fileSize : MAX_FILE_SIZE,
    files    : 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return callback(
        new Error("Invalid format. Use JPEG, PNG, WEBP or AVIF."),
      );
    }

    callback(null, true);
  },
});
