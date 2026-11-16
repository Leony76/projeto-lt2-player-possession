import styles from './css/MyContacts.module.css';
import animations from '@assets/css/Animations.module.css';
import PageTitle from '@/components/PageTitle';
import imgPlaceholder from '@/assets/img/profile_image_placeholder.png';
import SearchBar from '@/components/SearchBar';
import Select from '@/components/Select';
import PaginationNavButtons from '@/components/PaginationNavButtons';
import ContactCard from '@/components/ContactCard';
import { toMonthDayYearTwelveHoursFormat } from '@/utils/toMonthDayYearTwelveHoursFormat.util';
import type { ContactsAdvancedFilter } from '@shared/maps/filters/contacts/contacts.filter';
import { ErrorState, LoadingState, NotFoundState } from '@/components/ListStates';
import type { ContactsRelationStatusFilter } from '@shared/maps/filters/contacts/contactRelationStatus.filter';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { BiSolidContact } from 'react-icons/bi';
import { useMyContact } from '@/hooks/pages/useMyContact.hook';

const MyContacts = (): React.JSX.Element => {

  const { states, setters, handlers } = useMyContact();

  return (
    <>
    {(states.contact && states.modal === 'CONFIRM_ACCEPT_CONTACT_REQUEST') && (
      <ConfirmationModal
        loading={states.isAcceptingContactRequest}
        message={`Are you sure you want to accept the contact request from ${states.contact.name}?`}
        onConfirm={() => handlers.handleAcceptContactRequest(states.contact!.id)}
        onCancel={() => {
          setters.setContact(null);
          setters.setModal(null);
        }}
      />
    )}

    {(states.contact && states.modal === 'CONFIRM_DENY_CONTACT_REQUEST') && (
      <ConfirmationModal
        loading={states.isDenyingContactRequest}
        message={`Are you sure you want to deny the contact request from ${states.contact.name}?`}
        onConfirm={() => handlers.handleDenyContactRequest(states.contact!.id)}
        onCancel={() => {
          setters.setModal(null);
          setters.setContact(null);
        }}
      />
    )}

    <div className={styles.container}>
      <PageTitle
        Icon={() => <BiSolidContact />}
        title={`My Contacts (${states.totalContacts})`}
      />

      <div className={styles.toolbar_container}>
        <SearchBar
          value={states.search}
          placeholder="Search contact..."
          debounceTime={400}
          onSearch={handlers.handleSearch}
          flex={4}
        />

        <Select
          value={states.contactsRelationStatusFilter ?? '_'}
          selectConfig="CONTACTS_RELATION_STATUS"
          onSelect={(filter) => handlers.handleContactRelationStatusFilter(filter as ContactsRelationStatusFilter)}
          flex={0.67}
        />

        <Select
          value={states.contactsAdvancedFilter ?? '_'}
          selectConfig="CONTACTS_ADVANCED_FILTER"
          onSelect={(filter) => handlers.handleAdvancedFilter(filter as ContactsAdvancedFilter)}
          flex={0.67}
        />
      </div>

      <nav className={styles.nav}>
        <ul className={styles.ul}>
          {states.loading && <LoadingState label='Contacts'/>}
          
          {(!states.loading && states.error) && <ErrorState error={states.error}/>}  

          {(!states.loading && !states.error && states.contacts.length === 0) && <NotFoundState label='contacts'/>}

          {(!states.loading && !states.error && states.contacts.length > 0) && (
            states.contacts.map((contact, index) => (
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
                  isAcceptingContactRequest={states.isAcceptingContactRequest}
                  isDenyingContactRequest={states.isDenyingContactRequest}
                  onAcceptContactRequest={() => {
                    setters.setModal('CONFIRM_ACCEPT_CONTACT_REQUEST');
                    setters.setContact(contact);
                  }}
                  onDenyContactRequest={() => {
                    setters.setModal('CONFIRM_DENY_CONTACT_REQUEST');
                    setters.setContact(contact);
                  }}
                />
              </li>
            ))
          )}
        </ul>
      </nav>

      {states.pagination && states.pagination.totalPages > 1 && (
        <PaginationNavButtons
          hasPreviousPage={states.pagination.hasPreviousPage}
          hasNextPage={states.pagination.hasNextPage}
          loading={states.loading}
          page={states.page}
          totalPages={states.pagination.totalPages}
          setPage={handlers.handlePage}
        />
      )}  
    </div>
    </>
  )
}

export default MyContacts