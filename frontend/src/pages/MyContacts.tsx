import React, { useCallback, useEffect, useState } from 'react'
import styles from './css/MyContacts.module.css';
import animations from '@assets/css/Animations.module.css';
import PageTitle from '@/components/PageTitle';
import imgPlaceholder from '@/assets/img/profile_image_placeholder.png';
import SearchBar from '@/components/SearchBar';
import Select from '@/components/Select';
import type { PaginatedResponse } from '@shared/dtos/pagination.dto';
import { normalizeFilter } from '@/utils/normalizaFilter.util';
import PaginationNavButtons from '@/components/PaginationNavButtons';
import ContactCard from '@/components/ContactCard';
import { toMonthDayYearTwelveHoursFormat } from '@/utils/toMonthDayYearTwelveHoursFormat.util';
import type { ContactsAdvancedFilter } from '@shared/maps/filters/contacts/contacts.filter';
import { ContactService } from '@/services/contact.service';
import type { ContactResponse } from '@shared/dtos/contact.dto';
import { ErrorState, LoadingState, NotFoundState } from '@/components/ListStates';
import { handleAxiosError } from '@/utils/handleAxiosError.util';
import { useToast } from '@/contexts/ToastContext';
import type { ContactRelationStatus, ContactsRelationStatusFilter } from '@shared/maps/filters/contacts/contactRelationStatus.filter';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { BiSolidContact } from 'react-icons/bi';
import { CONTACTS_PER_PAGE } from '@/consts/contactsPerPage.const';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useUpdateParams } from '@/hooks/useUpdateParams.hook';
import type { LayoutOutletContext } from '@/types/layoutOutletContext.type';

type Modals = 
| 'CONFIRM_DENY_CONTACT_REQUEST'
| 'CONFIRM_ACCEPT_CONTACT_REQUEST'
;

const MyContacts = (): React.JSX.Element => {

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

  return (
    <>
    {(contact && modal === 'CONFIRM_ACCEPT_CONTACT_REQUEST') && (
      <ConfirmationModal
        loading={isAcceptingContactRequest}
        message={`Are you sure you want to accept the contact request from ${contact.name}?`}
        onConfirm={() => handleAcceptContactRequest(contact.id)}
        onCancel={() => {
          setContact(null);
          setModal(null);
        }}
      />
    )}

    {(contact && modal === 'CONFIRM_DENY_CONTACT_REQUEST') && (
      <ConfirmationModal
        loading={isDenyingContactRequest}
        message={`Are you sure you want to deny the contact request from ${contact.name}?`}
        onConfirm={() => handleDenyContactRequest(contact.id)}
        onCancel={() => {
          setModal(null);
          setContact(null);
        }}
      />
    )}

    <div className={styles.container}>
      <PageTitle
        Icon={() => <BiSolidContact />}
        title={`My Contacts (${totalContacts})`}
      />

      <div className={styles.toolbar_container}>
        <SearchBar
          value={search}
          placeholder="Search contact..."
          debounceTime={400}
          onSearch={handleSearch}
          flex={4}
        />

        <Select
          value={contactsRelationStatusFilter ?? '_'}
          selectConfig="CONTACTS_RELATION_STATUS"
          onSelect={(filter) => handleContactRelationStatusFilter(filter as ContactsRelationStatusFilter)}
          flex={0.67}
        />

        <Select
          value={contactsAdvancedFilter ?? '_'}
          selectConfig="CONTACTS_ADVANCED_FILTER"
          onSelect={(filter) => handleAdvancedFilter(filter as ContactsAdvancedFilter)}
          flex={0.67}
        />
      </div>

      <nav className={styles.nav}>
        <ul className={styles.ul}>
          {loading && <LoadingState label='Contacts'/>}
          
          {(!loading && error) && <ErrorState error={error}/>}  

          {(!loading && !error && contacts.length === 0) && <NotFoundState label='contacts'/>}

          {(!loading && !error && contacts.length > 0) && (
            contacts.map((contact, index) => (
              <li 
              key={contact.id}
              className={`${styles.li} ${animations.fade_in}`}
              style={{ animationDelay: `${index * 80}ms` }}
              >
                <ContactCard
                  display='DETAILED'
                  userId={contact.id}
                  profileImageURL={contact.profileImageURL ?? imgPlaceholder}
                  username={contact.name}
                  joinedAt={toMonthDayYearTwelveHoursFormat(contact.joinedAt)}
                  contactRequestSentAt={contact.contactRequestSentAt}
                  totalItems={contact.totalItems}
                  relationStatus={contact.loggedUserContactStatus}
                  isAcceptingContactRequest={isAcceptingContactRequest}
                  isDenyingContactRequest={isDenyingContactRequest}
                  onAcceptContactRequest={() => {
                    setModal('CONFIRM_ACCEPT_CONTACT_REQUEST');
                    setContact(contact);
                  }}
                  onDenyContactRequest={() => {
                    setModal('CONFIRM_DENY_CONTACT_REQUEST');
                    setContact(contact);
                  }}
                />
              </li>
            ))
          )}
        </ul>
      </nav>

      {pagination && pagination.totalPages > 1 && (
        <PaginationNavButtons
          hasPreviousPage={pagination.hasPreviousPage}
          hasNextPage={pagination.hasNextPage}
          loading={loading}
          page={page}
          totalPages={pagination.totalPages}
          setPage={handlePage}
        />
      )}  
    </div>
    </>
  )
}

export default MyContacts