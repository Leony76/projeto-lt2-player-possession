import { useToast } from "@/contexts/ToastContext";
import type { ContactResponse } from "@shared/dtos/contact.dto";
import type { PaginatedResponse } from "@shared/dtos/pagination.dto";
import { useCallback, useEffect, useState } from "react";
import { useUpdateParams } from "../useUpdateParams.hook";
import { useSearchParams } from "react-router-dom";
import type { ContactsAdvancedFilter } from "@shared/maps/filters/contacts/contacts.filter";
import { ContactService } from "@/services/contact.service";
import { CONTACTS_PER_PAGE } from "@/consts/contactsPerPage.const";
import { normalizeFilter } from "@/utils/normalizaFilter.util";
import { handleAxiosError } from "@/utils/handleAxiosError.util";
import type { ContactRelationStatus } from "@shared/maps/filters/contacts/contactRelationStatus.filter";

type Modals = 
| 'CONFIRM_DENY_CONTACT_REQUEST'
| 'CONFIRM_ACCEPT_CONTACT_REQUEST'
;

export const useContacts = () => {

  const { showToast } = useToast();

  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [contact, setContact] = useState<ContactResponse | null>(null);

  const [pagination, setPagination] = useState<
    PaginatedResponse<ContactResponse>["pagination"] | null>(null)
  ;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAcceptingContactRequest, setIsAcceptingContactRequest] = useState<boolean>(false);
  const [isDenyingContactRequest, setIsDenyingContactRequest] = useState<boolean>(false);
  const [isAddingContact, setIsAddingContact] = useState<boolean>(false);

  const [modal, setModal] = useState<Modals | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const { updateParams } = useUpdateParams(setSearchParams);

  const page = Number(searchParams.get('page') ?? 1);
  const search = searchParams.get('search') ?? '';

  const contactsAdvancedFilter = (searchParams.get('advancedFilter') ?? '_') as ContactsAdvancedFilter;



  const handleUpdateUserContactStats = (
    contactId : number,
    message   : string,
    status    : ContactRelationStatus,
  ) => {
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



  const handleAddContact = async(
    contactId : number
  ): Promise<void> => {
    try {
      if (isAddingContact) return;
      setIsAddingContact(true);
      
      const response = await ContactService.addContactRequest(contactId);

      if (!response.success) {
        throw new Error("Unable to send contact request");
      }

      handleUpdateUserContactStats(
        contactId,
        response.message,
        response.body.requestStatus, 
      );
    } catch (error:unknown) {
      showToast('ERROR', handleAxiosError(error));  
    } finally {
      setIsAddingContact(false);
    }
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



  const handlePage = (newPage: number): void => {
    updateParams({
      page: String(newPage),
    });
  };



  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await ContactService.get({
          page,
          limit          : CONTACTS_PER_PAGE,
          search         : search || undefined,
          advancedFilter : normalizeFilter(contactsAdvancedFilter),
        }, controller.signal);

        if (controller.signal.aborted) return;

        setContacts(result.items);
        setPagination(result.pagination);

      } catch (error: unknown) {
        if (!controller.signal.aborted) setError(handleAxiosError(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [page, search, contactsAdvancedFilter]);



  return {
    states: {
      contact,
      contacts,
      loading,
      error,
      modal,
      search,
      page,
      pagination,
      contactsAdvancedFilter,
      isAcceptingContactRequest,
      isDenyingContactRequest,
      isAddingContact,
    },

    setters: {
      setContact,
      setContacts,
      setModal,
    },

    handlers: {
      handleAcceptContactRequest,
      handleAddContact,
      handleAdvancedFilter,
      handleSearch,
      handlePage,
      handleUpdateUserContactStats,
      handleDenyContactRequest,
    },

    hooks: {

    },
  }
}