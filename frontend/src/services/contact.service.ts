import { api } from "@/lib/api";
import type { ContactDetailsResponse, ContactFromHomeResponse, ContactResponse } from "@shared/dtos/contact.dto";
import type { SuccessfulOperationResponse } from "@shared/dtos/operationResult.dto";
import type { PaginatedResponse } from "@shared/dtos/pagination.dto";
import type { ContactsAdvancedFilter } from "@shared/maps/filters/contacts/contacts.filter";
import type { ContactRelationStatus } from "@shared/maps/filters/contacts/contactRelationStatus.filter";

type GetContactsParams = {
  page            : number;
  limit           : number;
  search?         : string;
  advancedFilter? : ContactsAdvancedFilter;
  relationStatus? : ContactRelationStatus;
  onlyMyContacts? : boolean;
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



  public static async getContactContacts(
    params    : GetContactsParams,
    contactId : number,
    signal?   : AbortSignal,
  ): Promise<PaginatedResponse<ContactResponse>> {

    const { data } = await api.get<
      PaginatedResponse<
        ContactResponse>>(
          `/contact/${contactId}/contacts`, 
          { params, signal },
        );
    
    return data;
  }



  public static async getContactsFromHome(   
  ): Promise<ContactFromHomeResponse> {

    const { data } = await api.get<
      ContactFromHomeResponse>(
        `/contact/get-to-home`
    );

    return data;
  }



  public static async getContactDetails(
    contactId: number,
  ): Promise<ContactDetailsResponse> {

    const { data } = await api.get<
      ContactDetailsResponse>(
        `/contact/get/${contactId}`
    );

    return data;
  }



  public static async addContactRequest(
    contactId: number,
  ): Promise<SuccessfulOperationResponse<{requestStatus: ContactRelationStatus}>> {

    const { data } = await api.post<
      SuccessfulOperationResponse<
        {requestStatus: ContactRelationStatus}>>(
          `/contact/${contactId}/add-contact-request`
      );

    return data;
  }



  public static async acceptContactRequest(
    contactId : number,
  ): Promise<SuccessfulOperationResponse<{requestStatus: ContactRelationStatus}>> {

    const { data } = await api.patch<
      SuccessfulOperationResponse<
        {requestStatus: ContactRelationStatus}>>(
          `/contact/${contactId}/accept-contact-request`
      );

    return data;
  }



  public static async denyContactRequest(
    contactId: number,
  ): Promise<SuccessfulOperationResponse<{requestStatus: ContactRelationStatus}>> {

    const { data } = await api.delete<
      SuccessfulOperationResponse<
        {requestStatus: ContactRelationStatus}>>(
         `/contact/${contactId}/deny-contact-request`
      );

    return data;
  }



  public static async cancelContactPendingRequest(
    contactId: number,
  ): Promise<SuccessfulOperationResponse<{requestStatus: ContactRelationStatus}>> {

    const { data } = await api.delete<
      SuccessfulOperationResponse<
        {requestStatus : ContactRelationStatus}>>(
          `/contact/${contactId}/cancel-contact-pending-request`
      );

    return data;
  }



  public static async undoContactRequest(
    contactId: number,
  ): Promise<SuccessfulOperationResponse<{requestStatus: ContactRelationStatus}>> {

    const { data } = await api.delete<
      SuccessfulOperationResponse<
        {requestStatus : ContactRelationStatus}>>(
          `/contact/${contactId}/undo-contact-request`
      );

    return data;
  }



  public static async getReceivedContactRequestsCount(
  ): Promise<{count: number}> {

    const { data } = await api.get<{count: number}>(
      `/contact/user/received-requests-count`
    );

    return data;
  }
}