import { APIError } from "@backend/middlewares/error.middleware.js";
import { AuthRepository } from "../auth/auth.repository.js";
import { ContactRepository } from "./contact.repository.js";
import { GetContactsFilters } from "@shared/maps/filters/contacts/getContacts.type.js";
import { ContactResponse } from "@shared/dtos/contact.dto.js";
import { PaginatedResponse } from "@shared/dtos/pagination.dto.js";
import { ContactMapper } from "./contact.mapper.js";

export class ContactService {

  public static async get(
    userId: number,
    page: number,
    limit: number,
    filters: GetContactsFilters,
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
      search: filters.search?.trim() || undefined,
    };

    const { contacts, totalContacts } =
      await ContactRepository.get(
        userId,
        currentPage,
        pageSize,
        normalizedFilters,
      );

    const totalPages = Math.ceil(totalContacts / pageSize);

    const normalizedContacts =
      ContactMapper.toContactsResponse(contacts);

    return {
      items: normalizedContacts,

      pagination: {
        page: currentPage,
        limit: pageSize,
        totalItems: totalContacts,
        totalPages,

        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
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
      if (existingContact.status === "ACCEPTED") {
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
}