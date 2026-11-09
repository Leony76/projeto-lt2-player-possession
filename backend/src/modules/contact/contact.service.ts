import { APIError } from "@backend/middlewares/error.middleware.js";
import { AuthRepository } from "../auth/auth.repository.js";
import { ContactRepository } from "./contact.repository.js";
import { GetContactsFilters } from "@shared/maps/filters/contacts/getContacts.type.js";
import { ContactDetailsResponse, ContactFromHomeResponse, ContactResponse } from "@shared/dtos/contact.dto.js";
import { PaginatedResponse } from "@shared/dtos/pagination.dto.js";
import { ContactMapper } from "./contact.mapper.js";
import { ContactRelationStatus } from "@shared/maps/filters/contacts/contactRelationStatus.filter.js";

export class ContactService {

  public static async get(
    userId  : number,
    page    : number,
    limit   : number,
    filters : GetContactsFilters,
  ): Promise<PaginatedResponse<ContactResponse>> {

    if (!userId) {
      throw new APIError(401, 'User not authenticated');
    }

    const currentPage = Math.max(1, Math.floor(page));

    const pageSize = Math.min(
      100,
      Math.max(1, Math.floor(limit)),
    );

    const normalizedFilters: GetContactsFilters = {
      ...filters,
      search : filters.search?.trim() || undefined,
    };

    const { contacts, totalUsers } =
      await ContactRepository.get(
        userId,
        currentPage,
        pageSize,
        normalizedFilters,
      );

    const totalPages = Math.ceil(totalUsers / pageSize);

    const normalizedContacts = ContactMapper.toContactsResponse(contacts);

    return {
      items: normalizedContacts,

      pagination: {
        page       : currentPage,
        limit      : pageSize,
        totalItems : totalUsers,
        totalPages,

        hasNextPage     : currentPage < totalPages,
        hasPreviousPage : currentPage > 1,
      },
    };
  }



  public static async getContactsFromHome(
    userId : number,
  ): Promise<ContactFromHomeResponse> {

    if (!userId) {
      throw new APIError(401, "User not authenticated");
    } 

    const contacts = await ContactRepository.getContactsFromHome(userId);

    return ContactMapper.toContactFromHomeResponse(contacts);
  }



  public static async sendContactRequest(
    requesterId : number,
    addresseeId : number,
  ) {
    if (requesterId === addresseeId) {
      throw new APIError(400, "You cannot send a contact request to yourself");
    }

    const addressee = await AuthRepository.findUserById(addresseeId);

    if (!addressee) {
      throw new APIError(404, "User not found");
    }

    const existingContact = await ContactRepository.findContactBetweenUsers(
      requesterId,
      addresseeId,
    );

    if (existingContact) {
      if (existingContact.status === "CONTACT") {
        throw new APIError(409, "You already have contact");
      }

      if (existingContact.status === "PENDING") {
        throw new APIError(409, "A contact request already exists");
      }
    }

    return await ContactRepository.createContactRequest(
      requesterId,
      addresseeId,
    );
  }



  public static async getContactDetails(
    contactId : number,
    userId    : number,
  ): Promise<ContactDetailsResponse> {

    if (!userId) {
      throw new APIError(401, "User not authenticated");
    } if (!Number.isInteger(contactId) || contactId <= 0) {
      throw new APIError(400, 'Invalid contact ID');
    }

    const details = await ContactRepository.getContactDetails(contactId, userId);

    if (!details) {
      throw new APIError(404, 'Contact not found');
    }

    return ContactMapper.toContactDetailsResponse(details);
  }



  public static async addContactRequest(
    contactId : number,
    userId    : number,
  ): Promise<{requestStatus: ContactRelationStatus}> {

    if (!userId) {
      throw new APIError(401, "User not authenticated");
    } if (!Number.isInteger(contactId) || contactId <= 0) {
      throw new APIError(400, 'Invalid contact ID');
    }

    const { status } = await ContactRepository.createContactRequest(userId, contactId);

    if (!status) {
      throw new APIError(404, 'Contact not found');
    }

    return {
      requestStatus: status === 'PENDING'
        ? 'REQUEST_SENT'
        : status,
    };
  }



  public static async acceptContactRequest(
    contactId : number,
    userId    : number,
  ): Promise<{requestStatus: ContactRelationStatus}> {

    if (!userId) {
      throw new APIError(401, "User not authenticated");
    } if (!Number.isInteger(contactId) || contactId <= 0) {
      throw new APIError(400, 'Invalid contact ID');
    }

    const result = await ContactRepository.acceptContactRequest(userId, contactId);

    if (result.count === 0) {
      throw new APIError(404, "Contact request not found or already processed");
    }

    return { requestStatus: 'CONTACT' };
  }



  public static async denyContactRequest(
    contactId : number,
    userId    : number,
  ): Promise<{requestStatus: ContactRelationStatus}> {

    if (!userId) {
      throw new APIError(401, "User not authenticated");
    } if (!Number.isInteger(contactId) || contactId <= 0) {
      throw new APIError(400, 'Invalid contact ID');
    }

    const result = await ContactRepository.denyContactRequest(userId, contactId);

    if (result.count === 0) {
      throw new APIError(404, "Contact request not found or already processed");
    }

    return { requestStatus: 'NOT_CONTACT' };
  }



  public static async cancelContactPendingRequest(
    contactId : number,
    userId    : number,
  ): Promise<{requestStatus: ContactRelationStatus}> {

    if (!userId) {
      throw new APIError(401, "User not authenticated");
    } if (!Number.isInteger(contactId) || contactId <= 0) {
      throw new APIError(400, 'Invalid contact ID');
    }

    const result = await ContactRepository.cancelContactRequest(userId, contactId);

    if (result.count === 0) {
      throw new APIError(404, "Contact request not found");
    }

    return {
      requestStatus : 'NOT_CONTACT'
    };
  }



  public static async undoContactRequest(
    contactId : number,
    userId    : number,
  ): Promise<{requestStatus: ContactRelationStatus}> {

    if (!userId) {
      throw new APIError(401, "User not authenticated");
    } if (!Number.isInteger(contactId) || contactId <= 0) {
      throw new APIError(400, 'Invalid contact ID');
    }

    const result = await ContactRepository.undoContactRequest(userId, contactId);

    if (result.count === 0) {
      throw new APIError(404, "Contact request not found");
    }

    return {
      requestStatus : 'NOT_CONTACT'
    };
  }
}