
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import type { Request, Response } from "express";

import { ContactController } from "../contact.controller.js";
import { ContactService } from "../contact.service.js";

vi.mock("../contact.service.js", () => ({
  ContactService: {
    get: vi.fn(),
    getContactContacts: vi.fn(),
    getContactsFromHome: vi.fn(),
    getContactDetails: vi.fn(),
    addContactRequest: vi.fn(),
    acceptContactRequest: vi.fn(),
    denyContactRequest: vi.fn(),
    cancelContactPendingRequest: vi.fn(),
    undoContactRequest: vi.fn(),
    getUserReceivedContactRequestsCount: vi.fn(),
  },
}));

describe("ContactController", () => {

  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      authUserId: 1,
      params: {},
    };

    res = {
      locals: {
        validatedData: {
          page: 1,
          limit: 10,
          search: "Player",
          advancedFilter: undefined,
          onlyMyContacts: false,
          relationStatus: undefined,
        },
      },

      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });


  describe("get", () => {

    it("should return contacts with status 200", async () => {

      const response = {
        items: [],
        pagination: {},
      };

      vi.mocked(ContactService.get)
        .mockResolvedValue(response as never);

      await ContactController.get(
        req as Request,
        res as Response,
      );

      expect(ContactService.get).toHaveBeenCalledWith(
        1,
        1,
        10,
        {
          search: "Player",
          advancedFilter: undefined,
          onlyMyContacts: false,
        },
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(response);
    });

  });


  describe("getContactContacts", () => {

    it("should return contact's contacts", async () => {

      req.params = {
        id: "2",
      };

      vi.mocked(ContactService.getContactContacts)
        .mockResolvedValue({ items: [] } as never);

      await ContactController.getContactContacts(
        req as Request,
        res as Response,
      );

      expect(ContactService.getContactContacts)
        .toHaveBeenCalledWith(
          1,
          2,
          1,
          10,
          {
            search: "Player",
            advancedFilter: undefined,
            onlyMyContacts: false,
          },
        );

      expect(res.status).toHaveBeenCalledWith(200);
    });

  });


  describe("getContactsFromHome", () => {

    it("should return home contacts", async () => {

      const response = {
        contacts: [],
        totalContacts: 0,
      };

      vi.mocked(ContactService.getContactsFromHome)
        .mockResolvedValue(response);

      await ContactController.getContactsFromHome(
        req as Request,
        res as Response,
      );

      expect(ContactService.getContactsFromHome)
        .toHaveBeenCalledWith(1);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(response);
    });

  });


  describe("getContactDetails", () => {

    it("should return contact details", async () => {

      req.params = {
        id: "2",
      };

      const response = {
        id: 2,
        name: "Player2",
      };

      vi.mocked(ContactService.getContactDetails)
        .mockResolvedValue(response as never);

      await ContactController.getContactDetails(
        req as Request,
        res as Response,
      );

      expect(ContactService.getContactDetails)
        .toHaveBeenCalledWith(2, 1);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(response);
    });

  });


  describe("addContactRequest", () => {

    it("should send a contact request", async () => {

      req.params = {
        id: "2",
      };

      const result = {
        requestStatus: "REQUEST_SENT",
      };

      vi.mocked(ContactService.addContactRequest)
        .mockResolvedValue(result as never);

      await ContactController.addContactRequest(
        req as Request,
        res as Response,
      );

      expect(ContactService.addContactRequest)
        .toHaveBeenCalledWith(2, 1);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        body: result,
        message: "Add contact request sent",
        success: true,
      });
    });

  });


  describe("acceptContactRequest", () => {

    it("should accept a contact request", async () => {

      req.params = {
        id: "2",
      };

      vi.mocked(ContactService.acceptContactRequest)
        .mockResolvedValue({
          requestStatus: "CONTACT",
        });

      await ContactController.acceptContactRequest(
        req as Request,
        res as Response,
      );

      expect(ContactService.acceptContactRequest)
        .toHaveBeenCalledWith(2, 1);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        body: {
          requestStatus: "CONTACT",
        },
        message: "Contact request accepted",
        success: true,
      });
    });

  });


  describe("denyContactRequest", () => {

    it("should deny a contact request", async () => {

      req.params = {
        id: "2",
      };

      vi.mocked(ContactService.denyContactRequest)
        .mockResolvedValue({
          requestStatus: "NOT_CONTACT",
        });

      await ContactController.denyContactRequest(
        req as Request,
        res as Response,
      );

      expect(ContactService.denyContactRequest)
        .toHaveBeenCalledWith(2, 1);

      expect(res.status).toHaveBeenCalledWith(200);
    });

  });


  describe("cancelContactPendingRequest", () => {

    it("should cancel a pending request", async () => {

      req.params = {
        id: "2",
      };

      vi.mocked(ContactService.cancelContactPendingRequest)
        .mockResolvedValue({
          requestStatus: "NOT_CONTACT",
        });

      await ContactController.cancelContactPendingRequest(
        req as Request,
        res as Response,
      );

      expect(ContactService.cancelContactPendingRequest)
        .toHaveBeenCalledWith(2, 1);

      expect(res.status).toHaveBeenCalledWith(200);
    });

  });


  describe("undoContactRequest", () => {

    it("should remove a contact", async () => {

      req.params = {
        id: "2",
      };

      vi.mocked(ContactService.undoContactRequest)
        .mockResolvedValue({
          requestStatus: "NOT_CONTACT",
        });

      await ContactController.undoContactRequest(
        req as Request,
        res as Response,
      );

      expect(ContactService.undoContactRequest)
        .toHaveBeenCalledWith(2, 1);

      expect(res.status).toHaveBeenCalledWith(200);
    });

  });


  describe("getUserReceivedContactRequestsCount", () => {

    it("should return received requests count", async () => {

      const response = {
        count: 5,
      };

      vi.mocked(ContactService.getUserReceivedContactRequestsCount)
        .mockResolvedValue(response);

      await ContactController.getUserReceivedContactRequestsCount(
        req as Request,
        res as Response,
      );

      expect(ContactService.getUserReceivedContactRequestsCount)
        .toHaveBeenCalledWith(1);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(response);
    });
  });
});
