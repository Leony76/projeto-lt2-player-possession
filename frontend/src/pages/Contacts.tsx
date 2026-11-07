import React, { useEffect, useState } from 'react'
import styles from './css/Contacts.module.css';
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import imgPlaceholder from '@/assets/img/profile_image_placeholder.png';
import SearchBar from '@/components/SearchBar';
import Select from '@/components/Select';
import type { ItemsState } from '@shared/maps/filters/items/itemState.map';
import type { ItemResponse } from '@shared/dtos/item.dto';
import type { PaginatedResponse } from '@shared/dtos/pagination.dto';
import { normalizeFilter } from '@/utils/normalizaFilter.util';
import PaginationNavButtons from '@/components/PaginationNavButtons';
import { IoMdContact } from 'react-icons/io';
import ContactCard from '@/components/ContactCard';
import { toMonthDayYearTwelveHoursFormat } from '@/utils/toMonthDayYearTwelveHoursFormat.util';
import type { ContactsAdvancedFilter } from '@shared/maps/filters/contacts/contacts.filter';
import { ContactService } from '@/services/contact.service';
import type { ContactResponse } from '@shared/dtos/contact.dto';

const CONTACTS_PER_PAGE = 60;

const Contacts = (): React.JSX.Element => {

  const [contacts, setContacts] = useState<ContactResponse[]>([]);

  const [pagination, setPagination] = useState<
    PaginatedResponse<ItemResponse>["pagination"] | null>(null)
  ;

  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>("");

  const [contactsAdvancedFilter, setContactsAdvancedFilter] = useState<ContactsAdvancedFilter | null>(null);

  useEffect(() => {

    const controller = new AbortController();

    const loadItems = async () => {
      setLoading(true);
      setError(null);

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
        if (!controller.signal.aborted) setError("Unable to load items.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadItems();

    return () => controller.abort();

  }, [
    page,
    search,
    // itemsCategoryFilter,
    // itemsSubcategoryFilter,
    contactsAdvancedFilter,
  ]);

  const handleSearch = (value: string): void => {
    setSearch(value);
    setPage(1);
  };

  const handleSubcategoryFilter = (filter: ItemsState): void => {
    // setItemsSubcategoryFilter(filter);
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
            onSelect={(filter) => handleSubcategoryFilter(filter as ItemsState)}
            flex={0.67}
          />
        </div>

        <nav className={styles.nav}>
          <ul className={styles.ul}>
            {contacts.map((contact) => (
              <li 
              className={styles.li}
              key={contact.id}
              >
                <ContactCard
                  display='DETAILED'
                  joinedAt={toMonthDayYearTwelveHoursFormat(contact.joinedAt)}
                  profileImageURL={contact.profileImageURL ?? imgPlaceholder}
                  username={contact.name}
                  relationStatus={contact.loggedUserContactStatus}
                  totalItems={contact.totalItems}
                  userId={contact.id}
                />
              </li>
            ))}
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