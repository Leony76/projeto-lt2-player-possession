
import { describe, it, expect } from "vitest";
import { ContactMapper } from "../contact.mapper.js";

describe("ContactMapper", () => {

  describe("toPaginatedContactsResponse", () => {

    it("should return contacts with pagination information", () => {

      const joinedAt = new Date("2026-01-01T10:00:00Z");

      const contacts = [
        {
          id: 1,
          name: "Player123",
          profileImageURL: null,
          joinedAt,
          totalItems: 5,
          contactRequestSentAt: null,
          loggedUserContactStatus: "CONTACT",
        },
      ];

      const result = ContactMapper.toPaginatedContactsResponse(
        contacts,
        25,
        2,
        10,
      );

      expect(result).toEqual({
        items: [
          {
            id: 1,
            name: "Player123",
            profileImageURL: null,
            joinedAt: joinedAt.toISOString(),
            totalItems: 5,
            contactRequestSentAt: null,
            loggedUserContactStatus: "CONTACT",
          },
        ],

        pagination: {
          page: 2,
          limit: 10,
          totalItems: 25,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      });
    });


    it("should calculate pagination correctly when there are no contacts", () => {

      const result = ContactMapper.toPaginatedContactsResponse(
        [],
        0,
        1,
        10,
      );

      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });

      expect(result.items).toEqual([]);
    });

  });


  describe("toContactsResponse", () => {

    it("should convert dates and preserve null values", () => {

      const joinedAt = new Date("2026-01-01T10:00:00Z");

      const requestSentAt = new Date("2026-02-01T10:00:00Z");

      const result = ContactMapper.toContactsResponse([
        {
          id: 1,
          name: "Player123",
          profileImageURL: null,
          joinedAt,
          totalItems: 10,
          contactRequestSentAt: requestSentAt,
          loggedUserContactStatus: "PENDING",
        },
      ]);

      expect(result[0]).toEqual({
        id: 1,
        name: "Player123",
        profileImageURL: null,
        joinedAt: joinedAt.toISOString(),
        totalItems: 10,
        contactRequestSentAt: requestSentAt.toISOString(),
        loggedUserContactStatus: "PENDING",
      });
    });

  });


  describe("toContactDetailsResponse", () => {

    it("should convert dates and normalize null original prices", () => {

      const joinedAt = new Date("2026-01-01T10:00:00Z");

      const data = {
        id: 2,
        name: "Player2",
        profileImageURL: null,
        lumberBucks: 500,
        joinedAt,
        totalItems: 2,
        totalContacts: 5,
        loggedUserContactStatus: "CONTACT",
        contactRequestSentAt: null,

        contacts: [
          {
            id: 3,
            profileImageURL: null,
            username: "Player3",
          },
        ],

        items: [
          {
            units: 2,
            id: 10,
            description: null,
            name: "Fire Axe",
            category: "AXE",
            state: "NEW",
            originalPrice: null,
            averageMarketPrice: 100,
            imageURL: "fire-axe.webp",
          },
        ],
      };

      const result = ContactMapper.toContactDetailsResponse(
        data as never
      );

      expect(result.joinedAt).toBe(joinedAt.toISOString());

      expect(result.contactRequestSentAt).toBeNull();

      expect(result.items[0]!.originalPrice).toBe(-1);

      expect(result.items[0]!.averageMarketPrice).toBe(100);

      expect(result.contacts).toEqual(data.contacts);
    });


    it("should preserve original prices when they are not null", () => {

      const data = {
        id: 2,
        name: "Player2",
        profileImageURL: null,
        lumberBucks: 500,
        joinedAt: new Date(),
        totalItems: 1,
        totalContacts: 0,
        loggedUserContactStatus: "NOT_CONTACT",
        contactRequestSentAt: null,
        contacts: [],
        items: [
          {
            units: 1,
            id: 10,
            description: null,
            name: "Fire Axe",
            category: "AXE",
            state: "NEW",
            originalPrice: 250,
            averageMarketPrice: 300,
            imageURL: "fire-axe.webp",
          },
        ],
      };

      const result = ContactMapper.toContactDetailsResponse(
        data as never
      );

      expect(result.items[0]!.originalPrice).toBe(250);
    });

  });


  describe("toContactFromHomeResponse", () => {

    it("should convert bigint total contacts into number", () => {

      const result = ContactMapper.toContactFromHomeResponse([
        {
          id: 1,
          name: "Player123",
          profileImageURL: null,
          joinedAt: new Date(),
          totalContacts: 25n,
        },
      ]);

      expect(result).toEqual({
        contacts: [
          {
            id: 1,
            name: "Player123",
            profileImageURL: null,
          },
        ],
        totalContacts: 25,
      });
    });


    it("should return zero when there are no contacts", () => {

      const result = ContactMapper.toContactFromHomeResponse([]);

      expect(result).toEqual({
        contacts: [],
        totalContacts: 0,
      });
    });
  });
});
