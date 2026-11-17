import { beforeEach, describe, expect, it, vi } from "vitest";
import { Readable } from "node:stream";
import { CloudinaryService } from "../cloudinary.service.js";

const mocks = vi.hoisted(() => ({
  uploadStream: vi.fn(),
  pipe: vi.fn(),
}));

vi.mock("node:stream", () => ({
  Readable: {
    from: vi.fn(() => ({
      pipe: mocks.pipe,
    })),
  },
}));

vi.mock("../../../config/cloudinary.config.js", () => ({
  default: {
    uploader: {
      upload_stream: mocks.uploadStream,
    },
  },
}));

describe("CloudinaryService", () => {
  const userId = 1;

  const file = {
    buffer: Buffer.from("fake-image"),
    originalname: "profile.png",
    mimetype: "image/png",
  } as Express.Multer.File;

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.pipe.mockReturnValue(undefined);
  });

  describe("uploadProfileImage", () => {
    it("should upload the profile image successfully", async () => {
      const uploadResult = {
        secure_url: "https://cloudinary.com/profile.png",
        public_id: "user-1-123456",
      };

      mocks.uploadStream.mockImplementation(
        (_options, callback) => {
          callback(null, uploadResult);

          return {};
        },
      );

      const result = await CloudinaryService.uploadProfileImage(
        file,
        userId,
      );

      expect(mocks.uploadStream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: "lt2-players-possession/users-profile-images",
          resource_type: "image",
          public_id: expect.stringMatching(/^user-1-\d+$/),
        }),
        expect.any(Function),
      );

      expect(Readable.from).toHaveBeenCalledWith(file.buffer);

      expect(mocks.pipe).toHaveBeenCalled();

      expect(result).toEqual({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      });
    });

    it("should reject when Cloudinary returns an error", async () => {
      const uploadError = new Error("Cloudinary upload failed");

      mocks.uploadStream.mockImplementation(
        (_options, callback) => {
          callback(uploadError, undefined);

          return {};
        },
      );

      await expect(
        CloudinaryService.uploadProfileImage(file, userId),
      ).rejects.toThrow("Cloudinary upload failed");

      expect(mocks.pipe).toHaveBeenCalled();
    });

    it("should reject when Cloudinary does not return a result", async () => {
      mocks.uploadStream.mockImplementation(
        (_options, callback) => {
          callback(null, undefined);

          return {};
        },
      );

      await expect(
        CloudinaryService.uploadProfileImage(file, userId),
      ).rejects.toThrow(
        "Cloudinary did not return the upload result.",
      );
    });

    it("should use the correct userId in the public_id", async () => {
      mocks.uploadStream.mockImplementation(
        (_options, callback) => {
          callback(null, {
            secure_url: "https://cloudinary.com/profile.png",
            public_id: "user-25-123456",
          });

          return {};
        },
      );

      await CloudinaryService.uploadProfileImage(file, 25);

      expect(mocks.uploadStream).toHaveBeenCalledWith(
        expect.objectContaining({
          public_id: expect.stringMatching(/^user-25-\d+$/),
        }),
        expect.any(Function),
      );
    });
  });
});