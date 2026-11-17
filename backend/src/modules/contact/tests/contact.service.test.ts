
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import { ContactService } from "../contact.service.js";
import { ContactRepository } from "../contact.repository.js";
import { AuthRepository } from "../../auth/auth.repository.js";
import { ContactMapper } from "../contact.mapper.js";
import { APIError } from "@backend/middlewares/error.middleware.js";

vi.mock("../contact.repository.js", () => ({
  ContactRepository: {
    get: vi.fn(),
    getContactContacts: vi.fn(),
    getContactsFromHome: vi.fn(),
    findContactBetweenUsers: vi.fn(),
    createContactRequest: vi.fn(),
    getContactDetails: vi.fn(),
    acceptContactRequest: vi.fn(),
    denyContactRequest: vi.fn(),
    cancelContactRequest: vi.fn(),
    undoContactRequest: vi.fn(),
    getUserReceivedContactRequestsCount: vi.fn(),
  },
}));

vi.mock("../../auth/auth.repository.js", () => ({
  AuthRepository: {
    findUserById: vi.fn(),
  },
}));

vi.mock("../contact.mapper.js", () => ({
  ContactMapper: {
    toPaginatedContactsResponse: vi.fn(),
    toContactFromHomeResponse: vi.fn(),
    toContactDetailsResponse: vi.fn(),
  },
}));



describe("ContactService", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe.each([
    ["addContactRequest", ContactService.addContactRequest],
    ["acceptContactRequest", ContactService.acceptContactRequest],
    ["denyContactRequest", ContactService.denyContactRequest],
    ["cancelContactPendingRequest", ContactService.cancelContactPendingRequest],
    ["undoContactRequest", ContactService.undoContactRequest],
  ])("%s", (_name, method) => {

    it("should throw 401 when user is not authenticated", async () => {

      await expect(
        method(2, 0)
      ).rejects.toThrow(APIError);

    });


    it("should throw 400 when contact ID is invalid", async () => {

      await expect(
        method(0, 1)
      ).rejects.toThrow(APIError);

      await expect(
        method(1.5, 1)
      ).rejects.toThrow(APIError);

    });

  });


  describe("get", () => {

    it("should throw 401 when user is not authenticated", async () => {

      await expect(
        ContactService.get(0, 1, 10, {})
      ).rejects.toThrow(APIError);

      expect(ContactRepository.get).not.toHaveBeenCalled();
    });


    it("should normalize pagination and search filters", async () => {

      vi.mocked(ContactRepository.get)
        .mockResolvedValue({
          contacts: [],
          totalUsers: 0,
        } as never);

      vi.mocked(ContactMapper.toPaginatedContactsResponse)
        .mockReturnValue({} as never);

      await ContactService.get(
        1,
        0,
        150,
        {
          search: "  Player123  ",
        },
      );

      expect(ContactRepository.get).toHaveBeenCalledWith(
        1,
        1,
        100,
        {
          search: "Player123",
        },
      );
    });


    it("should convert empty search into undefined", async () => {

      vi.mocked(ContactRepository.get)
        .mockResolvedValue({
          contacts: [],
          totalUsers: 0,
        } as never);

      vi.mocked(ContactMapper.toPaginatedContactsResponse)
        .mockReturnValue({} as never);

      await ContactService.get(
        1,
        1,
        10,
        {
          search: "   ",
        },
      );

      expect(ContactRepository.get).toHaveBeenCalledWith(
        1,
        1,
        10,
        {
          search: undefined,
        },
      );
    });


    it("should return mapped contacts", async () => {

      const contacts = [
        { id: 2, name: "Player2" },
      ];

      const mappedResponse = {
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      vi.mocked(ContactRepository.get)
        .mockResolvedValue({
          contacts,
          totalUsers: 1,
        } as never);

      vi.mocked(ContactMapper.toPaginatedContactsResponse)
        .mockReturnValue(mappedResponse as never);

      const result = await ContactService.get(
        1,
        1,
        10,
        {},
      );

      expect(result).toEqual(mappedResponse);

      expect(ContactMapper.toPaginatedContactsResponse)
        .toHaveBeenCalledWith(contacts, 1, 1, 10);
    });

  });



  describe("getContactContacts", () => {

    it("should throw 401 when user is not authenticated", async () => {

      await expect(
        ContactService.getContactContacts(0, 2, 1, 10, {})
      ).rejects.toThrow(APIError);

      expect(ContactRepository.getContactContacts)
        .not.toHaveBeenCalled();
    });


    it("should throw 400 when contact ID is invalid", async () => {

      await expect(
        ContactService.getContactContacts(1, 1, 1, 10, {})
      ).rejects.toThrow(APIError);

      expect(ContactRepository.getContactContacts)
        .not.toHaveBeenCalled();
    });


    it("should retrieve contacts using the correct IDs", async () => {

      vi.mocked(ContactRepository.getContactContacts)
        .mockResolvedValue({
          contacts: [],
          totalUsers: 0,
        } as never);

      vi.mocked(ContactMapper.toPaginatedContactsResponse)
        .mockReturnValue({} as never);

      await ContactService.getContactContacts(
        1,
        2,
        1,
        10,
        {},
      );

      expect(ContactRepository.getContactContacts)
        .toHaveBeenCalledWith(
          2,
          1,
          1,
          10,
          {},
        );
    });

  });



  describe("getContactsFromHome", () => {

    it("should throw 401 when user is not authenticated", async () => {

      await expect(
        ContactService.getContactsFromHome(0)
      ).rejects.toThrow(APIError);

      expect(ContactRepository.getContactsFromHome)
        .not.toHaveBeenCalled();
    });


    it("should return mapped home contacts", async () => {

      const contacts = [
        { id: 2, name: "Player2" },
      ];

      const mappedResponse = {
        contacts: [],
        totalContacts: 0,
      };

      vi.mocked(ContactRepository.getContactsFromHome)
        .mockResolvedValue(contacts as never);

      vi.mocked(ContactMapper.toContactFromHomeResponse)
        .mockReturnValue(mappedResponse as never);

      const result = await ContactService.getContactsFromHome(1);

      expect(result).toEqual(mappedResponse);

      expect(ContactRepository.getContactsFromHome)
        .toHaveBeenCalledWith(1);
    });

  });



  describe("sendContactRequest", () => {

    it("should reject requests to yourself", async () => {

      await expect(
        ContactService.sendContactRequest(1, 1)
      ).rejects.toThrow(APIError);

      expect(AuthRepository.findUserById)
        .not.toHaveBeenCalled();
    });


    it("should throw 404 when addressee does not exist", async () => {

      vi.mocked(AuthRepository.findUserById)
        .mockResolvedValue(null);

      await expect(
        ContactService.sendContactRequest(1, 2)
      ).rejects.toThrow(APIError);

      expect(ContactRepository.findContactBetweenUsers)
        .not.toHaveBeenCalled();
    });


    it("should reject when users are already contacts", async () => {

      vi.mocked(AuthRepository.findUserById)
        .mockResolvedValue({ id: 2 } as never);

      vi.mocked(ContactRepository.findContactBetweenUsers)
        .mockResolvedValue({
          status: "CONTACT",
        } as never);

      await expect(
        ContactService.sendContactRequest(1, 2)
      ).rejects.toThrow(APIError);

      expect(ContactRepository.createContactRequest)
        .not.toHaveBeenCalled();
    });


    it("should reject when a pending request already exists", async () => {

      vi.mocked(AuthRepository.findUserById)
        .mockResolvedValue({ id: 2 } as never);

      vi.mocked(ContactRepository.findContactBetweenUsers)
        .mockResolvedValue({
          status: "PENDING",
        } as never);

      await expect(
        ContactService.sendContactRequest(1, 2)
      ).rejects.toThrow(APIError);

      expect(ContactRepository.createContactRequest)
        .not.toHaveBeenCalled();
    });


    it("should create a contact request", async () => {

      const createdRequest = {
        id: 10,
        requesterId: 1,
        addresseeId: 2,
        status: "PENDING",
      };

      vi.mocked(AuthRepository.findUserById)
        .mockResolvedValue({ id: 2 } as never);

      vi.mocked(ContactRepository.findContactBetweenUsers)
        .mockResolvedValue(null);

      vi.mocked(ContactRepository.createContactRequest)
        .mockResolvedValue(createdRequest as never);

      const result = await ContactService.sendContactRequest(1, 2);

      expect(result).toEqual(createdRequest);

      expect(ContactRepository.createContactRequest)
        .toHaveBeenCalledWith(1, 2);
    });

  });



  describe("getContactDetails", () => {

    it("should throw 401 when user is not authenticated", async () => {

      await expect(
        ContactService.getContactDetails(2, 0)
      ).rejects.toThrow(APIError);

      expect(ContactRepository.getContactDetails)
        .not.toHaveBeenCalled();
    });


    it("should reject invalid contact IDs", async () => {

      await expect(
        ContactService.getContactDetails(0, 1)
      ).rejects.toThrow(APIError);

      await expect(
        ContactService.getContactDetails(1.5, 1)
      ).rejects.toThrow(APIError);

      expect(ContactRepository.getContactDetails)
        .not.toHaveBeenCalled();
    });


    it("should throw 404 when contact does not exist", async () => {

      vi.mocked(ContactRepository.getContactDetails)
        .mockResolvedValue(null);

      await expect(
        ContactService.getContactDetails(2, 1)
      ).rejects.toThrow(APIError);
    });


    it("should return mapped contact details", async () => {

      const details = {
        id: 2,
        name: "Player2",
      };

      const mappedDetails = {
        id: 2,
        name: "Player2",
      };

      vi.mocked(ContactRepository.getContactDetails)
        .mockResolvedValue(details as never);

      vi.mocked(ContactMapper.toContactDetailsResponse)
        .mockReturnValue(mappedDetails as never);

      const result = await ContactService.getContactDetails(2, 1);

      expect(result).toEqual(mappedDetails);

      expect(ContactMapper.toContactDetailsResponse)
        .toHaveBeenCalledWith(details);
    });

  });



  describe("addContactRequest", () => {

    it("should return REQUEST_SENT when request is pending", async () => {

      vi.mocked(ContactRepository.createContactRequest)
        .mockResolvedValue({
          status: "PENDING",
        } as never);

      const result = await ContactService.addContactRequest(2, 1);

      expect(result).toEqual({
        requestStatus: "REQUEST_SENT",
      });
    });


    it("should throw 404 when contact does not exist", async () => {

      vi.mocked(ContactRepository.createContactRequest)
        .mockResolvedValue({
          status: null,
        } as never);

      await expect(
        ContactService.addContactRequest(2, 1)
      ).rejects.toThrow(APIError);
    });


    it("should reject invalid contact IDs", async () => {

      await expect(
        ContactService.addContactRequest(0, 1)
      ).rejects.toThrow(APIError);

      expect(ContactRepository.createContactRequest)
        .not.toHaveBeenCalled();
    });

  });



  describe("acceptContactRequest", () => {

    it("should return CONTACT when request is accepted", async () => {

      vi.mocked(ContactRepository.acceptContactRequest)
        .mockResolvedValue({
          count: 1,
        } as never);

      const result = await ContactService.acceptContactRequest(2, 1);

      expect(result).toEqual({
        requestStatus: "CONTACT",
      });
    });


    it("should throw 404 when request does not exist", async () => {

      vi.mocked(ContactRepository.acceptContactRequest)
        .mockResolvedValue({
          count: 0,
        } as never);

      await expect(
        ContactService.acceptContactRequest(2, 1)
      ).rejects.toThrow(APIError);
    });

  });



  describe("denyContactRequest", () => {

    it("should return NOT_CONTACT when request is denied", async () => {

      vi.mocked(ContactRepository.denyContactRequest)
        .mockResolvedValue({
          count: 1,
        } as never);

      const result = await ContactService.denyContactRequest(2, 1);

      expect(result).toEqual({
        requestStatus: "NOT_CONTACT",
      });
    });


    it("should throw 404 when request does not exist", async () => {

      vi.mocked(ContactRepository.denyContactRequest)
        .mockResolvedValue({
          count: 0,
        } as never);

      await expect(
        ContactService.denyContactRequest(2, 1)
      ).rejects.toThrow(APIError);
    });

  });



  describe("cancelContactPendingRequest", () => {

    it("should return NOT_CONTACT when request is cancelled", async () => {

      vi.mocked(ContactRepository.cancelContactRequest)
        .mockResolvedValue({
          count: 1,
        } as never);

      const result = await ContactService.cancelContactPendingRequest(2, 1);

      expect(result).toEqual({
        requestStatus: "NOT_CONTACT",
      });
    });


    it("should throw 404 when request does not exist", async () => {

      vi.mocked(ContactRepository.cancelContactRequest)
        .mockResolvedValue({
          count: 0,
        } as never);

      await expect(
        ContactService.cancelContactPendingRequest(2, 1)
      ).rejects.toThrow(APIError);
    });

  });



  describe("undoContactRequest", () => {

    it("should return NOT_CONTACT when contact is removed", async () => {

      vi.mocked(ContactRepository.undoContactRequest)
        .mockResolvedValue({
          count: 1,
        } as never);

      const result = await ContactService.undoContactRequest(2, 1);

      expect(result).toEqual({
        requestStatus: "NOT_CONTACT",
      });
    });


    it("should throw 404 when contact does not exist", async () => {

      vi.mocked(ContactRepository.undoContactRequest)
        .mockResolvedValue({
          count: 0,
        } as never);

      await expect(
        ContactService.undoContactRequest(2, 1)
      ).rejects.toThrow(APIError);
    });

  });



  describe("getUserReceivedContactRequestsCount", () => {

    it("should throw 401 when user is not authenticated", async () => {

      await expect(
        ContactService.getUserReceivedContactRequestsCount(0)
      ).rejects.toThrow(APIError);

      expect(ContactRepository.getUserReceivedContactRequestsCount)
        .not.toHaveBeenCalled();
    });


    it("should return received contact requests count", async () => {

      vi.mocked(ContactRepository.getUserReceivedContactRequestsCount)
        .mockResolvedValue(5);

      const result =
        await ContactService.getUserReceivedContactRequestsCount(1);

      expect(result).toEqual({
        count: 5,
      });

      expect(ContactRepository.getUserReceivedContactRequestsCount)
        .toHaveBeenCalledWith(1);
    });

  });

});
