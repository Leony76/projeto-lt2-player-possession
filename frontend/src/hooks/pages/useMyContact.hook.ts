import { useToast } from "@/contexts/ToastContext";
import type { LayoutOutletContext } from "@/types/layoutOutletContext.type";
import type { ContactResponse } from "@shared/dtos/contact.dto";
import type { PaginatedResponse } from "@shared/dtos/pagination.dto";
import { useCallback, useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { useUpdateParams } from "../useUpdateParams.hook";
import type { ContactsAdvancedFilter } from "@shared/maps/filters/contacts/contacts.filter";
import type { ContactRelationStatus, ContactsRelationStatusFilter } from "@shared/maps/filters/contacts/contactRelationStatus.filter";
import { CONTACTS_PER_PAGE } from "@/consts/contactsPerPage.const";
import { normalizeFilter } from "@/utils/normalizaFilter.util";
import { handleAxiosError } from "@/utils/handleAxiosError.util";
import { ContactService } from "@/services/contact.service";

type Modals = 
| 'CONFIRM_DENY_CONTACT_REQUEST'
| 'CONFIRM_ACCEPT_CONTACT_REQUEST'
;

export const useMyContact = () => {

  const { showToast } = useToast();
  const { decrementReceivedContactRequestsCount } = useOutletContext<LayoutOutletContext>();

  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [totalContacts, setTotalContacts] = useState<number>(0);
  const [contact, setContact] = useState<ContactResponse | null>(null);

  const [pagination, setPagination] = useState<
    PaginatedResponse<ContactResponse>["pagination"] | null>(null)
  ;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAcceptingContactRequest, setIsAcceptingContactRequest] = useState<boolean>(false);
  const [isDenyingContactRequest, setIsDenyingContactRequest] = useState<boolean>(false);
  
  const [modal, setModal] = useState<Modals | null>(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const { updateParams } = useUpdateParams(setSearchParams);

  const page = Number(searchParams.get('page') ?? 1);
  const search = searchParams.get('search') ?? '';

  const contactsAdvancedFilter = (searchParams.get('advancedFilter') ?? '_') as ContactsAdvancedFilter;
  const contactsRelationStatusFilter = (searchParams.get('contactRelationStatusFilter') ?? '_') as ContactsRelationStatusFilter;



  const handleUpdateUserContactStats = (
    contactId : number,
    message   : string,
    status    : ContactRelationStatus,
  ): void => {
    
    decrementReceivedContactRequestsCount();

    setContacts(prev =>
      prev.map(contact =>
        contact.id === contactId
          ? { 
            ...contact, 
            loggedUserContactStatus : status
          } : contact
      )
    );

    showToast('INFO', message);
  }



  const handleAcceptContactRequest = async(
    contactId : number
  ): Promise<void> => {
    try {
      if (isAcceptingContactRequest) return;
      setIsAcceptingContactRequest(true);

      const response = await ContactService.acceptContactRequest(contactId);

      if (!response.success) {
        throw new Error("Unable to accept contact request");
      }

      handleUpdateUserContactStats(
        contactId,
        response.message,
        response.body.requestStatus, 
      );
    } catch (error:unknown) {
      showToast('ERROR', handleAxiosError(error));
    } finally {
      setIsAcceptingContactRequest(false);
      setContact(null);
    }  
  };



  const handleDenyContactRequest = async(
    contactId : number
  ): Promise<void> => {
    try {
      if (isDenyingContactRequest) return;
      setIsDenyingContactRequest(true);

      const response = await ContactService.denyContactRequest(contactId);

      if (!response.success) {
        throw new Error("Unable to cancel contact request");
      }
      
      handleUpdateUserContactStats(
        contactId,
        response.message,
        response.body.requestStatus, 
      );
    } catch (error:unknown) {
      showToast('ERROR', handleAxiosError(error));
    } finally {
      setIsDenyingContactRequest(false);
      setContact(null);
    }
  };



  const handleSearch = useCallback((value: string): void => {
    updateParams({
      search: value || null,
      page: '1',
    });
  }, [updateParams]);



  const handleAdvancedFilter = (
    filter: ContactsAdvancedFilter
  ): void => {
    updateParams({
      advancedFilter: filter === '_' ? null : filter,
      page: '1',
    });
  };



  const handleContactRelationStatusFilter = (
    filter: ContactsRelationStatusFilter
  ): void => {
    updateParams({
      contactRelationStatusFilter: filter === '_' ? null : filter,
      page: '1',
    });
  };



  const handlePage = (newPage: number): void => {
    updateParams({
      page: String(newPage),
    });
  };



  useEffect(() => {

    const controller = new AbortController();

    (async () => {
      try {
        const result = await ContactService.get({
          page,
          limit: CONTACTS_PER_PAGE,
          onlyMyContacts: true,
          search: search || undefined,
          advancedFilter: normalizeFilter(contactsAdvancedFilter),
          ...(contactsRelationStatusFilter !== '_' && {
            relationStatus: contactsRelationStatusFilter,
          }),
        }, controller.signal);

        setContacts(result.items);
        setPagination(result.pagination);
        setTotalContacts(result.pagination.totalItems);

      } catch (error:unknown) {
        if (!controller.signal.aborted) setError(handleAxiosError(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();

  }, [
    page,
    search,
    contactsAdvancedFilter,
    contactsRelationStatusFilter,
  ]);



  return {
    states: {
      contact,
      modal,
      page,
      search,
      error,
      loading,
      contacts,
      pagination,
      totalContacts,
      isAcceptingContactRequest,
      isDenyingContactRequest,
      contactsAdvancedFilter,
      contactsRelationStatusFilter,
    },

    setters: {
      setContact,
      setModal,
    },

    handlers: {
      handleAcceptContactRequest,
      handleDenyContactRequest,
      handleAdvancedFilter,
      handlePage,
      handleContactRelationStatusFilter,
      handleSearch,
    },
  }
}