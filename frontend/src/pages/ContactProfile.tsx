import styles from './css/ContactProfile.module.css';
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import imgPlaceholder from '@/assets/img/placeholder_1.png';
import { FaArrowLeft, FaCheck, FaClock, FaMinus, FaPlus, FaUser } from 'react-icons/fa';
import profileImagePlaceholder from '@/assets/img/profile_image_placeholder.png';
import { MdOutlinePublic } from 'react-icons/md';
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat.util';
import SectionTitle from '@/components/SectionTitle';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/Button';
import { IoMdContact } from 'react-icons/io';
import ContactCard from '@/components/ContactCard';
import { LuBoxes } from 'react-icons/lu';
import ItemNavCard from '@/components/ItemNavCard';
import SeeAllLink from '@/components/SeeAllLink';
import { toMonthDayYearTwelveHoursFormat } from '@/utils/toMonthDayYearTwelveHoursFormat.util';
import { IoClose } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import { handleAxiosError } from '@/utils/handleAxiosError.util';
import { ContactService } from '@/services/contact.service';
import type { ContactDetailsResponse as ContactDetails } from '@shared/dtos/contact.dto';
import { ErrorState, LoadingState, NotFoundState } from '@/components/ListStates';
import ImageExpand from '@/components/ImageExpand';
import { useToast } from '@/contexts/ToastContext';
import type { ContactRelationStatus } from '@shared/types/contactRelationStatus.type';
import { useAuth } from '@/contexts/AuthContext';

const ContactProfile = (): React.JSX.Element | null => {

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const { id } = useParams();

  const [contact, setContact] = useState<ContactDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAcceptingContactRequest, setIsAcceptingContactRequest] = useState<boolean>(false);
  const [isDeningContactRequest, setIsDeningContactRequest] = useState<boolean>(false);
  const [isCancelingContactRequest, setIsCancellingContactRequest] = useState<boolean>(false);
  const [isAddingContact, setIsAddingContact] = useState<boolean>(false);

  const [profileImageExpand, setProfileImageExpand] = useState<boolean>(false);

  useEffect(() => {
    (async (contactId : number) => {
      try {
        const response = await ContactService.getContactDetails(contactId);

        setContact(response);
      } catch (error:unknown) {
        setError(handleAxiosError(error));
      } finally {
        setLoading(false);
      }
    })(Number(id));
  },[]);

  const handleSetNewContactRelationStatus = (
    relation : ContactRelationStatus,
    message  : string,
  ): void => {
    setContact(prev => {
      if (!prev) return null;
      return {
        ...prev,
        loggedUserContactStatus: relation,
      };
    });

    showToast('INFO', message); 
  };

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

      handleSetNewContactRelationStatus(
        response.body.requestStatus,
        response.message,
      );  
    } catch (error:unknown) {
      showToast('ERROR', handleAxiosError(error));  
    } finally {
      setIsAddingContact(false);
    }
  };

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

      handleSetNewContactRelationStatus(
        response.body.requestStatus,
        response.message,
      );  

      setContact(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          totalContacts: prev.totalContacts + 1,
          contacts: [
            ...prev.contacts,
            {
              id              : user?.id,
              profileImageURL : user?.profileImageURL,
              username        : user?.name,
            }
          ],
        };
      });
    } catch (error:unknown) {
      showToast('ERROR', handleAxiosError(error));
    } finally {
      setIsAcceptingContactRequest(false);
    }  
  };

  const handleDenyContactRequest = async(
    contactId : number
  ): Promise<void> => {
    try {
      if (isDeningContactRequest) return;
      setIsDeningContactRequest(true);

      const response = await ContactService.denyContactRequest(contactId);

      if (!response.success) {
        throw new Error("Unable to cancel contact request");
      }

      handleSetNewContactRelationStatus(
        response.body.requestStatus,
        response.message,
      );
    } catch (error:unknown) {
      showToast('ERROR', handleAxiosError(error));
    } finally {
      setIsDeningContactRequest(false);
    }
  };

  const handleUndoContactRequest = async(
    contactId : number
  ): Promise<void> => {
    try {
      if (isDeningContactRequest) return;
      setIsDeningContactRequest(true);

      const response = await ContactService.undoContactRequest(contactId);

      if (!response.success) {
        throw new Error("Unable to undo contact");
      }

      handleSetNewContactRelationStatus(
        response.body.requestStatus,
        response.message,
      );

      setContact(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          contacts: prev.contacts.filter(
            contact => contact.id !== contactId
          ),
        };
      });
    } catch (error:unknown) {
      showToast('ERROR', handleAxiosError(error));
    } finally {
      setIsDeningContactRequest(false);
    }
  };

  const handleCancelContactRequest = async(
    contactId : number
  ): Promise<void> => {
    try {
      if (isDeningContactRequest) return;
      setIsCancellingContactRequest(true);

      const response = await ContactService.cancelContactPendingRequest(contactId);

      if (!response.success) {
        throw new Error("Unable to cancel contact request");
      }

      handleSetNewContactRelationStatus(
        response.body.requestStatus,
        response.message,
      );
    } catch (error:unknown) {
      showToast('ERROR', handleAxiosError(error));
    } finally {
      setIsCancellingContactRequest(false);
    }
  };

  const USER_DESCRIPTIVE_INFOS_MAP: { label: string, value: string | number }[] = [
    { label: 'Identifier (Id):' , value: contact?.id ?? '?' },
    { label: 'Username:'        , value: contact?.name ?? 'unknown' },
    { label: 'Lumber bucks:'    , value: contact?.lumberBucks !== undefined ? toLumberBucksFormat(contact.lumberBucks) : '$?' },
    { label: 'Contacts:'        , value: contact?.totalContacts ?? '?' },
    { label: 'Total items:'     , value: contact?.totalItems ?? '?' },
    { label: 'Join date'        , value: contact?.joinedAt ? toMonthDayYearTwelveHoursFormat('2026-11-07T13:59:00.000Z') : '??/??/??, ??/?? ??' },
  ]; 
  
  if (user?.id === Number(id)) {
    return <Navigate to="/home" replace />;
  }

  return (
    <Layout >
      <>
      {profileImageExpand &&
        <ImageExpand
          imageURL={contact?.profileImageURL ?? profileImagePlaceholder}
          label={contact?.name ?? 'unknown'}
          onClick={() => setProfileImageExpand(false)}
        />
      }

      <div className={styles.container}>
        <div className={styles.page_title_history_back_container}>
          <button 
          className={styles.history_back_button}
          onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>

          <PageTitle
            Icon={() => <FaUser />}
            title='Contact Profile'
          />
        </div>

        { loading && <LoadingState label='contact details'/> }

        {(!loading && error) && <ErrorState error={error} />}
        
        {(!loading && !error && contact) &&
          <div className={styles.main_container}>
            <section className={styles.contact_general_infos_section_container}>
              <button 
              onClick={() => setProfileImageExpand(true)}
              className={styles.profile_image_inner_container}
              >
                <img 
                  className={styles.profile_image}
                  src={contact?.profileImageURL ?? profileImagePlaceholder} 
                  alt={contact.name} 
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
                    {contact.loggedUserContactStatus === 'CONTACT' ? (
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
                        onClick={() => handleUndoContactRequest(contact.id)}
                        icon={() => <FaMinus />}
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
                    ) : contact.loggedUserContactStatus === 'REQUEST_SENT' ? (
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
                        onClick={() => handleCancelContactRequest(contact.id)}
                        label={isCancelingContactRequest ? 'Cancelling...' : 'Cancel'}
                        loading={isCancelingContactRequest}
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
                    ) : contact.loggedUserContactStatus === 'REQUEST_RECEIVED' ? (
                      <div className={styles.request_received}>
                        <span>
                          Contact request received
                        </span>

                        <div>
                          <Button
                            buttonStyle="DEFAULT"
                            onClick={() => handleAcceptContactRequest(contact.id)}
                            label={isAcceptingContactRequest ? 'Accepting...' : "Accept"}
                            loading={isAcceptingContactRequest}
                            disabled={isDeningContactRequest}
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
                            onClick={() => handleDenyContactRequest(contact.id)}
                            label={isDeningContactRequest ? 'Dening...' : "Deny"}
                            loading={isDeningContactRequest}
                            disabled={isAcceptingContactRequest}
                            icon={() => <IoClose />}
                            brightness={{
                              active: 0.4,
                              hover: 0.7,
                            }}
                            colors={{
                              background: '#dd384632',
                              labelBorder: '#dd3845'
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <Button
                        buttonStyle='DEFAULT'
                        label={isAddingContact ? 'Adding...' : "Add Contact"}
                        loading={isAddingContact}
                        onClick={() => handleAddContact(contact.id)}
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
                
                {contact.contacts.length > 9 && <SeeAllLink to={`/contact/${contact.id}/contacts`}/>}       
              </div>

              <nav className={styles.nav}>
                <ul className={styles.ul}> 
                  {contact.contacts.length === 0 ? (
                    <NotFoundState label='contacts'/>
                  ) : (
                    contact.contacts.slice(0, 9).map((contact) => (
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
                
                { contact.items.length > 7 && <SeeAllLink to={`/contact/${contact.id}/items`}/>}       
              </div>

              <nav className={styles.nav}>
                <ul className={styles.ul}>         
                  {contact.items.length === 0 ? (
                    <NotFoundState label='items'/>
                  ) : (
                    contact.items.slice(0, 6).map((item) => (
                      <li 
                      className={styles.li}
                      key={item.id}
                      >
                        <ItemNavCard
                          { ...item }
                          page='HOME/MY_ITEMS'
                        />
                      </li>
                    ))
                  )}    
                </ul>
              </nav>
            </section>
          </div>
        }

        {(!loading && !error && !contact) && <NotFoundState label={'contact details'}/>}
      </div>
      </>
    </Layout>
  )
}

export default ContactProfile