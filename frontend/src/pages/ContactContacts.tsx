import styles from './css/ContactContacts.module.css';
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
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { FaArrowLeft } from 'react-icons/fa';
import { BiSolidContact } from 'react-icons/bi';
import { useContactContacts } from '@/hooks/pages/useContactContacts.hook';

const ContactContacts = (): React.JSX.Element => {

  const { states, handlers, setters, hooks } = useContactContacts();

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
      <div className={styles.page_title_history_back_container}>
        <button 
        className={styles.history_back_button}
        onClick={() => hooks.navigate(-1)}>
          <FaArrowLeft />
        </button>

        <PageTitle
          Icon={() => <BiSolidContact />}
          title={`${states.contactName ?? '?'}'s contacts`}
        />
      </div>

      <div className={styles.toolbar_container}>
        <SearchBar
          value={states.search}
          placeholder="Search contact..."
          debounceTime={400}
          onSearch={handlers.handleSearch}
          flex={4}
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
              className={`${styles.li} ${animations.fade_in}`}
              style={{ animationDelay: `${index * 80}ms` }}
              key={contact.id}
              >
                <ContactCard
                  display='DETAILED'
                  userId={contact.id}
                  contactRequestSentAt={contact.contactRequestSentAt}
                  profileImageURL={contact.profileImageURL ?? imgPlaceholder}
                  username={contact.name}
                  joinedAt={toMonthDayYearTwelveHoursFormat(contact.joinedAt)}
                  totalItems={contact.totalItems}
                  relationStatus={contact.loggedUserContactStatus}
                  onAddContact={handlers.handleAddContact}
                  isAddingContact={states.isAddingContact}
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

export default ContactContacts