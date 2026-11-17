
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { UserController } from "../user.controller.js";

const mocks = vi.hoisted(() => ({
  editProfileImage: vi.fn(),
  verifyUsernameAvailability: vi.fn(),
  editUsername: vi.fn(),
  editLumberBucks: vi.fn(),
  passwordVerificationBeforeEdit: vi.fn(),
  editPassword: vi.fn(),
}));

vi.mock("../user.service.js", () => ({
  UserService: {
    editProfileImage: mocks.editProfileImage,
    verifyUsernameAvailability: mocks.verifyUsernameAvailability,
    editUsername: mocks.editUsername,
    editLumberBucks: mocks.editLumberBucks,
    passwordVerificationBeforeEdit: mocks.passwordVerificationBeforeEdit,
    editPassword: mocks.editPassword,
  },
}));

describe("UserController", () => {
  const userId = 1;

  let req: Request;
  let res: Response;

  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      authUserId: userId,
      body: {},
      file: undefined,
    } as unknown as Request;

    statusMock = vi.fn();
    jsonMock = vi.fn();

    const responseMock = {
      status: statusMock,
      json: jsonMock,
    };

    statusMock.mockReturnValue(responseMock);

    res = responseMock as unknown as Response;
  });

  describe("editProfileImage", () => {
    it("should call the service and return the updated profile image", async () => {
      const file = {
        originalname: "profile.png",
      } as Express.Multer.File;

      const imageURL = "https://example.com/profile.png";

      const serviceResponse = {
        profileImageURL: imageURL,
      };

      req.file = file;
      req.body = { imageURL };

      mocks.editProfileImage.mockResolvedValue(serviceResponse);

      await UserController.editProfileImage(req, res);

      expect(mocks.editProfileImage).toHaveBeenCalledWith(
        userId,
        file,
        imageURL,
      );

      expect(statusMock).toHaveBeenCalledWith(200);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        body: serviceResponse,
        message: "Profile image successfully updated",
      });
    });
  });

  describe("verifyUsernameAvailability", () => {
    it("should call the service and return username availability", async () => {
      req.body = {
        username: "Player",
      };

      const serviceResponse = {
        username: "Player",
      };

      mocks.verifyUsernameAvailability.mockResolvedValue(
        serviceResponse,
      );

      await UserController.verifyUsernameAvailability(req, res);

      expect(mocks.verifyUsernameAvailability).toHaveBeenCalledWith(
        "Player",
        userId,
      );

      expect(statusMock).toHaveBeenCalledWith(200);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        body: serviceResponse,
        message: "available",
      });
    });
  });

  describe("editUsername", () => {
    it("should call the service and return the updated username", async () => {
      req.body = {
        username: "NewPlayer",
      };

      const serviceResponse = {
        userId,
        username: "NewPlayer",
      };

      mocks.editUsername.mockResolvedValue(serviceResponse);

      await UserController.editUsername(req, res);

      expect(mocks.editUsername).toHaveBeenCalledWith(
        "NewPlayer",
        userId,
      );

      expect(statusMock).toHaveBeenCalledWith(200);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        body: serviceResponse,
        message: "Username successfully updated",
      });
    });
  });

  describe("editLumberBucks", () => {
    it("should call the service and return the updated Lumber Bucks", async () => {
      req.body = {
        lumberBucks: 500,
      };

      const serviceResponse = {
        lumberBucks: 500,
      };

      mocks.editLumberBucks.mockResolvedValue(serviceResponse);

      await UserController.editLumberBucks(req, res);

      expect(mocks.editLumberBucks).toHaveBeenCalledWith(
        500,
        userId,
      );

      expect(statusMock).toHaveBeenCalledWith(200);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        body: serviceResponse,
        message: "Lumber bucks successfully updated",
      });
    });
  });

  describe("passwordVerificationBeforeEdit", () => {
    it("should call the service and return the password verification result", async () => {
      req.body = {
        password: "password123",
      };

      const serviceResponse = {
        success: true,
      };

      mocks.passwordVerificationBeforeEdit.mockResolvedValue(
        serviceResponse,
      );

      await UserController.passwordVerificationBeforeEdit(
        req,
        res,
      );

      expect(
        mocks.passwordVerificationBeforeEdit,
      ).toHaveBeenCalledWith("password123", userId);

      expect(statusMock).toHaveBeenCalledWith(200);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        body: serviceResponse,
        message: "verified",
      });
    });

    it("should return success false when the password is incorrect", async () => {
      req.body = {
        password: "wrong-password",
      };

      const serviceResponse = {
        success: false,
      };

      mocks.passwordVerificationBeforeEdit.mockResolvedValue(
        serviceResponse,
      );

      await UserController.passwordVerificationBeforeEdit(
        req,
        res,
      );

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        body: {
          success: false,
        },
        message: "verified",
      });
    });
  });

  describe("editPassword", () => {
    it("should call the service and return the password update result", async () => {
      req.body = {
        newPassword: "newPassword123",
      };

      const serviceResponse = {
        success: true,
      };

      mocks.editPassword.mockResolvedValue(serviceResponse);

      await UserController.editPassword(req, res);

      expect(mocks.editPassword).toHaveBeenCalledWith(
        "newPassword123",
        userId,
      );

      expect(statusMock).toHaveBeenCalledWith(200);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        body: serviceResponse,
        message: "Password successfully updated",
      });
    });
  });
});