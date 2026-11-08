import React, { useEffect, useState } from 'react'
import styles from './css/Contacts.module.css';
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import imgPlaceholder from '@/assets/img/profile_image_placeholder.png';
import SearchBar from '@/components/SearchBar';
import Select from '@/components/Select';
import type { PaginatedResponse } from '@shared/dtos/pagination.dto';
import { normalizeFilter } from '@/utils/normalizaFilter.util';
import PaginationNavButtons from '@/components/PaginationNavButtons';
import { IoMdContact } from 'react-icons/io';
import ContactCard from '@/components/ContactCard';
import { toMonthDayYearTwelveHoursFormat } from '@/utils/toMonthDayYearTwelveHoursFormat.util';
import type { ContactsAdvancedFilter } from '@shared/maps/filters/contacts/contacts.filter';
import { ContactService } from '@/services/contact.service';
import type { ContactResponse } from '@shared/dtos/contact.dto';
import { ErrorState, LoadingState, NotFoundState } from '@/components/ListStates';
import { handleAxiosError } from '@/utils/handleAxiosError.util';
import { useToast } from '@/contexts/ToastContext';

const CONTACTS_PER_PAGE = 60;

const Contacts = (): React.JSX.Element => {

  const { showToast } = useToast();

  const [contacts, setContacts] = useState<ContactResponse[]>([]);

  const [pagination, setPagination] = useState<
    PaginatedResponse<ContactResponse>["pagination"] | null>(null)
  ;

  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAcceptingContactRequest, setIsAcceptingContactRequest] = useState<boolean>(false);
  const [isDeningContactRequest, setIsDeningContactRequest] = useState<boolean>(false);
  const [isAddingContact, setIsAddingContact] = useState<boolean>(false);

  const [search, setSearch] = useState<string>("");

  const [contactsAdvancedFilter, setContactsAdvancedFilter] = useState<ContactsAdvancedFilter | null>(null);

  useEffect(() => {

    const controller = new AbortController();

    (async () => {
      try {
        const result = await ContactService.get({
          page,
          limit          : CONTACTS_PER_PAGE,
          search         : search || undefined,
          advancedFilter : normalizeFilter(contactsAdvancedFilter),
        }, controller.signal);

        setContacts(result.items);
        setPagination(result.pagination);

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
  ]);

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

      setContacts(prev =>
        prev.map(contact =>
          contact.id === contactId
            ? { 
              ...contact, 
              loggedUserContactStatus : response.body.requestStatus 
            } : contact
        )
      );

      showToast('INFO', response.message);   
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

    } catch (error:unknown) {
      showToast('ERROR', handleAxiosError(error));
    } finally {
      setIsAcceptingContactRequest(false);
    }  
  }

  const handleDenyContactRequest = async(
    contactId : number
  ): Promise<void> => {
    try {
      if (isDeningContactRequest) return;
      setIsDeningContactRequest(true);

    } catch (error:unknown) {
      showToast('ERROR', handleAxiosError(error));
    } finally {
      setIsDeningContactRequest(false);
    }
  }

  const handleSearch = (value: string): void => {
    setSearch(value);
    setPage(1);
  };

  const handleAdvancedFilter = (filter: ContactsAdvancedFilter): void => {
    setContactsAdvancedFilter(filter);
    setPage(1);
  };

  return (
    <Layout tab='CONTACTS'>
      <div className={styles.container}>
        <PageTitle
          Icon={() => <IoMdContact />}
          title='Contacts'
        />

        <div className={styles.toolbar_container}>
          <SearchBar
            placeholder="Search contact..."
            debounceTime={400}
            onSearch={handleSearch}
            flex={4}
          />

          <Select
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
              contacts.map((contact) => (
                <li 
                className={styles.li}
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
                    onAcceptContactRequest={handleAcceptContactRequest}
                    onDenyContactRequest={handleDenyContactRequest}
                    isAddingContact={isAddingContact}
                    isAcceptingContactRequest={isAcceptingContactRequest}
                    isDeningContactRequest={isDeningContactRequest}
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
            page={pagination.page}
            totalPages={pagination.totalPages}
            setPage={setPage}
          />
        )}  
      </div>
    </Layout>
  )
}

export default Contacts