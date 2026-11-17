import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService } from "../user.service.js";

const mocks = vi.hoisted(() => ({
  uploadProfileImage: vi.fn(),
  editProfileImage: vi.fn(),

  verifyUsernameAvailability: vi.fn(),
  editUsername: vi.fn(),

  editLumberBucks: vi.fn(),
  editPassword: vi.fn(),

  findUserById: vi.fn(),

  argonHash: vi.fn(),
  argonVerify: vi.fn(),
}));

vi.mock("../../cloudinary/cloudinary.service.js", () => ({
  CloudinaryService: {
    uploadProfileImage: mocks.uploadProfileImage,
  },
}));

vi.mock("../user.repository.js", () => ({
  UserRepository: {
    editProfileImage: mocks.editProfileImage,
    verifyUsernameAvailability: mocks.verifyUsernameAvailability,
    editUsername: mocks.editUsername,
    editLumberBucks: mocks.editLumberBucks,
    editPassword: mocks.editPassword,
  },
}));

vi.mock("../../auth/auth.repository.js", () => ({
  AuthRepository: {
    findUserById: mocks.findUserById,
  },
}));

vi.mock("argon2", () => ({
  default: {
    hash: mocks.argonHash,
    verify: mocks.argonVerify,
  },
}));

describe("UserService", () => {
  const userId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("editProfileImage", () => {
    const imageResponse = {
      profileImageURL: "https://cloudinary.com/profile.png",
    };

    it("should throw 401 when user is not authenticated", async () => {
      await expect(
        UserService.editProfileImage(undefined),
      ).rejects.toThrow("User not authenticated");

      expect(mocks.editProfileImage).not.toHaveBeenCalled();
    });

    it("should throw 400 when no image is provided", async () => {
      await expect(
        UserService.editProfileImage(userId),
      ).rejects.toThrow("No image was provided");

      expect(mocks.uploadProfileImage).not.toHaveBeenCalled();
      expect(mocks.editProfileImage).not.toHaveBeenCalled();
    });

    it("should upload the image to Cloudinary and update the profile image", async () => {
      const file = {
        originalname: "profile.png",
      } as Express.Multer.File;

      mocks.uploadProfileImage.mockResolvedValue({
        url: imageResponse.profileImageURL,
      });

      mocks.editProfileImage.mockResolvedValue(imageResponse);

      const result = await UserService.editProfileImage(
        userId,
        file,
      );

      expect(mocks.uploadProfileImage).toHaveBeenCalledWith(
        file,
        userId,
      );

      expect(mocks.editProfileImage).toHaveBeenCalledWith(
        userId,
        imageResponse.profileImageURL,
      );

      expect(result).toEqual(imageResponse);
    });

    it("should use the provided imageURL without uploading to Cloudinary", async () => {
      const imageURL = "https://example.com/profile.png";

      mocks.editProfileImage.mockResolvedValue({
        profileImageURL: imageURL,
      });

      const result = await UserService.editProfileImage(
        userId,
        undefined,
        imageURL,
      );

      expect(mocks.uploadProfileImage).not.toHaveBeenCalled();

      expect(mocks.editProfileImage).toHaveBeenCalledWith(
        userId,
        imageURL,
      );

      expect(result).toEqual({
        profileImageURL: imageURL,
      });
    });

    it("should prioritize the file when both file and imageURL are provided", async () => {
      const file = {
        originalname: "profile.png",
      } as Express.Multer.File;

      const imageURL = "https://example.com/profile.png";

      mocks.uploadProfileImage.mockResolvedValue({
        url: "https://cloudinary.com/uploaded.png",
      });

      mocks.editProfileImage.mockResolvedValue(imageResponse);

      await UserService.editProfileImage(
        userId,
        file,
        imageURL,
      );

      expect(mocks.uploadProfileImage).toHaveBeenCalledWith(
        file,
        userId,
      );

      expect(mocks.editProfileImage).toHaveBeenCalledWith(
        userId,
        "https://cloudinary.com/uploaded.png",
      );
    });

    it("should propagate Cloudinary errors", async () => {
      const file = {
        originalname: "profile.png",
      } as Express.Multer.File;

      mocks.uploadProfileImage.mockRejectedValue(
        new Error("Cloudinary upload failed"),
      );

      await expect(
        UserService.editProfileImage(userId, file),
      ).rejects.toThrow("Cloudinary upload failed");

      expect(mocks.editProfileImage).not.toHaveBeenCalled();
    });
  });

  describe("verifyUsernameAvailability", () => {
    it("should throw 401 when user is not authenticated", async () => {
      await expect(
        UserService.verifyUsernameAvailability("Player", undefined),
      ).rejects.toThrow("User not authenticated");

      expect(mocks.verifyUsernameAvailability).not.toHaveBeenCalled();
    });

    it("should throw 400 when username is empty", async () => {
      await expect(
        UserService.verifyUsernameAvailability("", userId),
      ).rejects.toThrow("No username was provided");

      expect(mocks.verifyUsernameAvailability).not.toHaveBeenCalled();
    });

    it("should throw 409 when username is already taken", async () => {
      mocks.verifyUsernameAvailability.mockResolvedValue(true);

      await expect(
        UserService.verifyUsernameAvailability("Player", userId),
      ).rejects.toThrow("Username already taken");

      expect(mocks.verifyUsernameAvailability).toHaveBeenCalledWith(
        "Player",
      );
    });

    it("should return the username when it is available", async () => {
      mocks.verifyUsernameAvailability.mockResolvedValue(false);

      const result = await UserService.verifyUsernameAvailability(
        "Player",
        userId,
      );

      expect(mocks.verifyUsernameAvailability).toHaveBeenCalledWith(
        "Player",
      );

      expect(result).toEqual({
        username: "Player",
      });
    });

    it("should propagate repository errors", async () => {
      mocks.verifyUsernameAvailability.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        UserService.verifyUsernameAvailability("Player", userId),
      ).rejects.toThrow("Database error");
    });
  });

  describe("editUsername", () => {
    it("should throw 401 when user is not authenticated", async () => {
      await expect(
        UserService.editUsername("Player", undefined),
      ).rejects.toThrow("User not authenticated");

      expect(mocks.verifyUsernameAvailability).not.toHaveBeenCalled();
      expect(mocks.editUsername).not.toHaveBeenCalled();
    });

    it("should throw 400 when username is empty", async () => {
      await expect(
        UserService.editUsername("", userId),
      ).rejects.toThrow("No username was provided");

      expect(mocks.verifyUsernameAvailability).not.toHaveBeenCalled();
    });

    it("should throw 409 when username is already taken", async () => {
      mocks.verifyUsernameAvailability.mockResolvedValue(true);

      await expect(
        UserService.editUsername("Player", userId),
      ).rejects.toThrow("Username already taken");

      expect(mocks.editUsername).not.toHaveBeenCalled();
    });

    it("should update the username and return the mapped response", async () => {
      mocks.verifyUsernameAvailability.mockResolvedValue(false);

      mocks.editUsername.mockResolvedValue({
        id: userId,
        name: "NewPlayer",
      });

      const result = await UserService.editUsername(
        "NewPlayer",
        userId,
      );

      expect(mocks.verifyUsernameAvailability).toHaveBeenCalledWith(
        "NewPlayer",
      );

      expect(mocks.editUsername).toHaveBeenCalledWith(
        "NewPlayer",
        userId,
      );

      expect(result).toEqual({
        userId,
        username: "NewPlayer",
      });
    });

    it("should propagate repository errors", async () => {
      mocks.verifyUsernameAvailability.mockResolvedValue(false);

      mocks.editUsername.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        UserService.editUsername("Player", userId),
      ).rejects.toThrow("Database error");
    });
  });

  describe("editLumberBucks", () => {
    it("should throw 401 when user is not authenticated", async () => {
      await expect(
        UserService.editLumberBucks(100, undefined),
      ).rejects.toThrow("User not authenticated");

      expect(mocks.editLumberBucks).not.toHaveBeenCalled();
    });

    it("should throw 400 when lumberBucks is null", async () => {
      await expect(
        UserService.editLumberBucks(null as never, userId),
      ).rejects.toThrow("Invalid lumber bucks amount");

      expect(mocks.editLumberBucks).not.toHaveBeenCalled();
    });

    it("should update the user's Lumber Bucks", async () => {
      mocks.editLumberBucks.mockResolvedValue({
        lumberBucks: 500,
      });

      const result = await UserService.editLumberBucks(
        500,
        userId,
      );

      expect(mocks.editLumberBucks).toHaveBeenCalledWith(
        500,
        userId,
      );

      expect(result).toEqual({
        lumberBucks: 500,
      });
    });

    it("should allow zero Lumber Bucks", async () => {
      mocks.editLumberBucks.mockResolvedValue({
        lumberBucks: 0,
      });

      const result = await UserService.editLumberBucks(
        0,
        userId,
      );

      expect(mocks.editLumberBucks).toHaveBeenCalledWith(
        0,
        userId,
      );

      expect(result).toEqual({
        lumberBucks: 0,
      });
    });

    it("should propagate repository errors", async () => {
      mocks.editLumberBucks.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        UserService.editLumberBucks(100, userId),
      ).rejects.toThrow("Database error");
    });
  });

  describe("passwordVerificationBeforeEdit", () => {
    it("should throw 401 when user is not authenticated", async () => {
      await expect(
        UserService.passwordVerificationBeforeEdit(
          "password123",
          undefined,
        ),
      ).rejects.toThrow("User not authenticated");

      expect(mocks.findUserById).not.toHaveBeenCalled();
    });

    it("should throw 400 when password is empty", async () => {
      await expect(
        UserService.passwordVerificationBeforeEdit("", userId),
      ).rejects.toThrow("No password was provided");

      expect(mocks.findUserById).not.toHaveBeenCalled();
    });

    it("should throw 500 when user has no password hash", async () => {
      mocks.findUserById.mockResolvedValue(null);

      await expect(
        UserService.passwordVerificationBeforeEdit(
          "password123",
          userId,
        ),
      ).rejects.toThrow("Unable to do password verification");

      expect(mocks.argonVerify).not.toHaveBeenCalled();
    });

    it("should return success true when password matches", async () => {
      mocks.findUserById.mockResolvedValue({
        passwordHash: "hashed-password",
      });

      mocks.argonVerify.mockResolvedValue(true);

      const result = await UserService.passwordVerificationBeforeEdit(
        "password123",
        userId,
      );

      expect(mocks.findUserById).toHaveBeenCalledWith(userId);

      expect(mocks.argonVerify).toHaveBeenCalledWith(
        "hashed-password",
        "password123",
      );

      expect(result).toEqual({
        success: true,
      });
    });

    it("should return success false when password does not match", async () => {
      mocks.findUserById.mockResolvedValue({
        passwordHash: "hashed-password",
      });

      mocks.argonVerify.mockResolvedValue(false);

      const result = await UserService.passwordVerificationBeforeEdit(
        "wrong-password",
        userId,
      );

      expect(result).toEqual({
        success: false,
      });
    });

    it("should propagate argon2 errors", async () => {
      mocks.findUserById.mockResolvedValue({
        passwordHash: "hashed-password",
      });

      mocks.argonVerify.mockRejectedValue(
        new Error("Password verification failed"),
      );

      await expect(
        UserService.passwordVerificationBeforeEdit(
          "password123",
          userId,
        ),
      ).rejects.toThrow("Password verification failed");
    });
  });

  describe("editPassword", () => {
    it("should throw 401 when user is not authenticated", async () => {
      await expect(
        UserService.editPassword("newPassword123", undefined),
      ).rejects.toThrow("User not authenticated");

      expect(mocks.argonHash).not.toHaveBeenCalled();
      expect(mocks.editPassword).not.toHaveBeenCalled();
    });

    it("should throw 400 when password is empty", async () => {
      await expect(
        UserService.editPassword("", userId),
      ).rejects.toThrow("No password was provided");

      expect(mocks.argonHash).not.toHaveBeenCalled();
    });

    it("should hash the new password and update it in the repository", async () => {
      mocks.argonHash.mockResolvedValue("new-hashed-password");

      mocks.editPassword.mockResolvedValue({
        id: userId,
      });

      const result = await UserService.editPassword(
        "newPassword123",
        userId,
      );

      expect(mocks.argonHash).toHaveBeenCalledWith(
        "newPassword123",
      );

      expect(mocks.editPassword).toHaveBeenCalledWith(
        "new-hashed-password",
        userId,
      );

      expect(result).toEqual({
        success: true,
      });
    });

    it("should return success false when repository returns an invalid id", async () => {
      mocks.argonHash.mockResolvedValue("new-hashed-password");

      mocks.editPassword.mockResolvedValue({
        id: 0,
      });

      const result = await UserService.editPassword(
        "newPassword123",
        userId,
      );

      expect(result).toEqual({
        success: false,
      });
    });

    it("should propagate argon2 hash errors", async () => {
      mocks.argonHash.mockRejectedValue(
        new Error("Hashing failed"),
      );

      await expect(
        UserService.editPassword("newPassword123", userId),
      ).rejects.toThrow("Hashing failed");

      expect(mocks.editPassword).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      mocks.argonHash.mockResolvedValue("new-hashed-password");

      mocks.editPassword.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        UserService.editPassword("newPassword123", userId),
      ).rejects.toThrow("Database error");
    });
  });
});