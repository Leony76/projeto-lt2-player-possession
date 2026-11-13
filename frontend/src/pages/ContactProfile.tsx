import styles from './css/ContactProfile.module.css';
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import imgPlaceholder from '@/assets/img/profile_image_placeholder.png';
import { FaArrowLeft, FaCheck, FaClock, FaMinus, FaPlus, FaUser } from 'react-icons/fa';
import { MdOutlinePublic } from 'react-icons/md';
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat.util';
import SectionTitle from '@/components/SectionTitle';
import { Navigate } from 'react-router-dom';
import Button from '@/components/Button';
import { IoMdContact } from 'react-icons/io';
import ContactCard from '@/components/ContactCard';
import { LuBoxes } from 'react-icons/lu';
import ItemNavCard from '@/components/ItemNavCard';
import SeeAllLink from '@/components/SeeAllLink';
import { toMonthDayYearTwelveHoursFormat } from '@/utils/toMonthDayYearTwelveHoursFormat.util';
import { IoClose } from 'react-icons/io5';
import { ErrorState, LoadingState, NotFoundState } from '@/components/ListStates';
import { useContactProfile } from '@/hooks/pages/useContactProfile.hook';
import ContactProfileModals from '@/components/modals/pages/ContactProfileModals';

const ContactProfile = (): React.JSX.Element | null => {

  const contactProfile = useContactProfile();
  const { handlers, hooks, setters, states, user, misc } = contactProfile;

  const USER_DESCRIPTIVE_INFOS_MAP: { label: string, value: string | number }[] = [
    { label: 'Identifier (Id):' , value: states.contact?.id ?? '?' },
    { label: 'Username:'        , value: states.contact?.name ?? 'unknown' },
    { label: 'Lumber bucks:'    , value: states.contact?.lumberBucks !== undefined ? toLumberBucksFormat(states.contact.lumberBucks) : '$?' },
    { label: 'Contacts:'        , value: states.contact?.totalContacts ?? '?' },
    { label: 'Total items:'     , value: states.contact?.totalItems ?? '?' },
    { label: 'Join date'        , value: states.contact?.joinedAt ? toMonthDayYearTwelveHoursFormat('2026-11-07T13:59:00.000Z') : '??/??/??, ??/?? ??' },
  ]; 
  
  if (user?.id === Number(states.contact?.id)) {
    return <Navigate to="/home" replace />;
  }

  return (
    <Layout >
      <>
      <ContactProfileModals contactProfile={contactProfile}/>

      <div className={styles.container}>
        <div className={styles.page_title_history_back_container}>
          <button 
          className={styles.history_back_button}
          onClick={() => hooks.navigate(-1)}>
            <FaArrowLeft />
          </button>

          <PageTitle
            Icon={() => <FaUser />}
            title='Contact Profile'
          />
        </div>

        { states.loading && <LoadingState label='contact details'/> }

        {(!states.loading && states.error) && <ErrorState error={states.error} />}
        
        {(!states.loading && !states.error && states.contact) &&
          <div className={styles.main_container}>
            <section className={styles.contact_general_infos_section_container}>
              <button 
              onClick={() => setters.setModal('PROFILE_IMAGE_EXPAND')}
              className={styles.profile_image_inner_container}
              >
                <img 
                  className={styles.profile_image}
                  src={states.contact?.profileImageURL ?? misc.profileImagePlaceholder} 
                  alt={states.contact.name} 
                />
              </button>

              <div className={styles.contact_descriptive_infos_container}>
                <SectionTitle
                  icon={() => <MdOutlinePublic />}
                  title='Public infos'
                />

                <div className={styles.dl_contact_actions_container}>
                  <dl className={styles.dl}>
                    { USER_DESCRIPTIVE_INFOS_MAP.map((item, index) => {
                      return (
                        <div 
                        className={styles.dt_dd_container} 
                        key={index}
                        >
                          <dt className={styles.dt} title={item.label}>
                            { item.label } 
                          </dt>

                          <dd className={styles.dd} title={item.value.toString()}> 
                            { item.value } 
                          </dd>
                        </div> 
                      )
                    })}
                  </dl>

                  <div className={styles.contact_actions_container}>
                    {states.contact.loggedUserContactStatus === 'CONTACT' ? (
                      <>
                      <div className={styles.contacts_label_being_contacts}>
                        <FaCheck />
                        <span>
                          Contacts
                        </span>
                      </div>
                      
                      <span>•</span>

                      <Button
                        buttonStyle='DEFAULT'
                        label='Undo contact'
                        onClick={() => setters.setModal('CONFIRM_UNDO_CONTACT')}
                        icon={() => <FaMinus />}
                        iconPosition={{
                          bottom: '-3px'
                        }}
                        brightness={{
                          active : 0.4,
                          hover  : 0.7,
                        }}
                        colors={{
                          background: '#dd384632',
                          labelBorder: '#dd3845'
                        }}
                      />
                      </>
                    ) : states.contact.loggedUserContactStatus === 'REQUEST_SENT' ? (
                      <>
                      <div className={styles.contacts_label_pending}>
                        <FaClock />
                        <span>
                        Pending
                        </span>
                      </div>
                      
                      <span>•</span>

                      <Button
                        buttonStyle='DEFAULT'
                        onClick={() => setters.setModal('CONFIRM_CANCEL_CONTACT_REQUEST')}
                        label={'Cancel'}
                        icon={() => <IoClose size={20}/>}
                        iconPosition={{
                          bottom: '-3px'
                        }}
                        brightness={{
                          active : 0.4,
                          hover  : 0.7,
                        }}
                        colors={{
                          background: '#dd384632',
                          labelBorder: '#dd3845'
                        }}
                      />
                      </>
                    ) : states.contact.loggedUserContactStatus === 'REQUEST_RECEIVED' ? (
                      <div className={styles.request_received}>
                        <span>
                          Contact request received
                        </span>

                        <div>
                          <Button
                            buttonStyle="DEFAULT"
                            onClick={() => setters.setModal('CONFIRM_ACCEPT_CONTACT_REQUEST')}
                            label={"Accept"}
                            icon={() => <FaCheck size={10}/>}
                            padding={{
                              X: '14px'
                            }}
                            brightness={{
                              active: 0.4,
                              hover: 0.7,
                            }}
                            colors={{
                              background: '#6fdd3832',
                              labelBorder: '#548e37fd',
                            }}
                          />

                          <Button
                            buttonStyle="DEFAULT"
                            onClick={() => setters.setModal('CONFIRM_DENY_CONTACT_REQUEST')}
                            label={"Deny"}
                            icon={() => <IoClose />}
                            brightness={{
                              active : 0.4,
                              hover  : 0.7,
                            }}
                            colors={{
                              background  : '#dd384632',
                              labelBorder : '#dd3845'
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <Button
                        buttonStyle='DEFAULT'
                        label={states.isAddingContact ? 'Adding...' : "Add Contact"}
                        loading={states.isAddingContact}
                        onClick={() => states.contact?.id 
                          ? handlers.handleAddContact(states.contact?.id!) 
                          : hooks.showToast('ERROR', 'Unable to procced the operation')
                        }
                        icon={() => <FaPlus />}
                        brightness={{
                          active : 0.4,
                          hover  : 0.7,
                        }}
                        colors={{
                          background: '#6fdd3832',
                          labelBorder: '#548e37fd'
                        }}
                      />
                    )}           
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.contact_first_9_contacts_container}>
              <div className={styles.label_see_all_container}>  
                <SectionTitle
                  icon={() => <IoMdContact />}
                  title='Contacts'
                />
                
                {states.contact.contacts.length > 9 && 
                  <SeeAllLink 
                    to={`/contact/${states.contact.id}/contacts?username=${encodeURIComponent(states.contact.name)}`}
                  />
                }       
              </div>

              <nav className={styles.nav}>
                <ul className={styles.ul}> 
                  {states.contact.contacts.length === 0 ? (
                    <NotFoundState label='contacts'/>
                  ) : (
                    states.contact.contacts.slice(0, 9).map((contact) => (
                      <li 
                      className={styles.li}
                      key={contact.id}
                      >
                        <ContactCard
                          display='SIMPLE'
                          profileImageURL={contact.profileImageURL ?? imgPlaceholder}
                          username={contact.username}
                          userId={contact.id}
                        />
                      </li>
                    ))
                  )}            
                </ul>
              </nav>
            </section>

            <section className={styles.contact_first_6_items_container}>
              <div className={styles.label_see_all_container}>  
                <SectionTitle
                  icon={() => <LuBoxes />}
                  title='Items'
                />
                
                {states.contact.items.length > 6 && 
                  <SeeAllLink 
                    to={`/contact/${states.contact.id}/items?username=${encodeURIComponent(states.contact.name)}`}
                  />
                }       
              </div>

              <nav className={styles.nav}>
                <ul className={styles.ul}>         
                  {states.contact.items.length === 0 ? (
                    <NotFoundState label='items'/>
                  ) : (
                    states.contact.items.slice(0, 6).map((item) => (
                      <li 
                      className={styles.li}
                      key={item.id}
                      >
                        <ItemNavCard
                          { ...item }
                          page='HOME/USER_ITEMS'
                        />
                      </li>
                    ))
                  )}    
                </ul>
              </nav>
            </section>
          </div>
        }

        {(!states.loading && !states.error && !states.contact) && <NotFoundState label={'contact details'}/>}
      </div>
      </>
    </Layout>
  )
}

export default ContactProfile