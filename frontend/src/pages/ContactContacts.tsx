import React, { useCallback, useEffect, useState } from 'react'
import styles from './css/ContactContacts.module.css';
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
import type { ContactRelationStatus } from '@shared/maps/filters/contacts/contactRelationStatus.filter';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { CONTACTS_PER_PAGE } from '@/consts/contactsPerPage.const';
import { FaArrowLeft } from 'react-icons/fa';
import { BiSolidContact } from 'react-icons/bi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useUpdateParams } from '@/hooks/useUpdateParams.hook';

type Modals = 
| 'CONFIRM_DENY_CONTACT_REQUEST'
| 'CONFIRM_ACCEPT_CONTACT_REQUEST'
;

const ContactContacts = (): React.JSX.Element => {

  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

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

  const contactName = searchParams.get('username') ?? '';
  const contactsAdvancedFilter = (searchParams.get('advancedFilter') ?? '_') as ContactsAdvancedFilter;

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    (async (contactId: number) => {
      try {
        const result = await ContactService.getContactContacts(
          {
            page,
            limit          : CONTACTS_PER_PAGE,
            search         : search || undefined,
            advancedFilter : normalizeFilter(contactsAdvancedFilter),
          }, 
          contactId,
          controller.signal
        );

        if (controller.signal.aborted) return;

        setContacts(result.items);
        setPagination(result.pagination);

      } catch (error: unknown) {
        if (!controller.signal.aborted) setError(handleAxiosError(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })(Number(id));

    return () => controller.abort();
  }, [page, search, contactsAdvancedFilter]);

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
      <div className={styles.page_title_history_back_container}>
        <button 
        className={styles.history_back_button}
        onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>

        <PageTitle
          Icon={() => <BiSolidContact />}
          title={`${contactName ?? '?'}'s contacts`}
        />
      </div>

      <div className={styles.toolbar_container}>
        <SearchBar
          value={search}
          placeholder="Search contact..."
          debounceTime={400}
          onSearch={handleSearch}
          flex={4}
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
              className={`${styles.li} ${animations.fade_in}`}
              style={{ animationDelay: `${index * 80}ms` }}
              key={contact.id}
              >
                <ContactCard
                  display='DETAILED'
                  userId={contact.id}
                  profileImageURL={contact.profileImageURL ?? imgPlaceholder}
                  username={contact.name}
                  joinedAt={toMonthDayYearTwelveHoursFormat(contact.joinedAt)}
                  totalItems={contact.totalItems}
                  relationStatus={contact.loggedUserContactStatus}
                  onAddContact={handleAddContact}
                  isAddingContact={isAddingContact}
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

export default ContactContacts