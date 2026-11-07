import { api } from "@/lib/api";
import type { ContactResponse } from "@shared/dtos/contact.dto";
import type { PaginatedResponse } from "@shared/dtos/pagination.dto";
import type { ContactsAdvancedFilter } from "@shared/maps/filters/contacts/contacts.filter";

type GetContactsParams = {
  page            : number;
  limit           : number;
  search?         : string;
  advancedFilter? : ContactsAdvancedFilter;
};

export class ContactService {

  public static async get(
    params  : GetContactsParams,
    signal? : AbortSignal,
  ): Promise<PaginatedResponse<ContactResponse>> {

    const { data } = await api.get<
      PaginatedResponse<
        ContactResponse>> (
          "/contact/get", 
          { params, signal },
        );
    
    return data;
  }
}