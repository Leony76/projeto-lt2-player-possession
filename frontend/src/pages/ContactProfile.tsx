import styles from './css/ContactProfile.module.css';
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import imgPlaceholder from '@/assets/img/placeholder_1.png';
import { FaArrowLeft, FaCheck, FaClock, FaMinus, FaPlus, FaUser } from 'react-icons/fa';
import profileImagePlaceholder from '@/assets/img/profile_image_placeholder.png';
import { MdOutlinePublic } from 'react-icons/md';
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat.util';
import SectionTitle from '@/components/SectionTitle';
import { useProfile } from '@/hooks/pages/useProfile.hook';
import { Navigate, useNavigate } from 'react-router-dom';
import ProfileModals from '@/components/modals/pages/ProfileModals';
import Button from '@/components/Button';
import { IoMdContact } from 'react-icons/io';
import ContactCard from '@/components/ContactCard';
import { LuBoxes } from 'react-icons/lu';
import ItemNavCard from '@/components/ItemNavCard';
import SeeAllLink from '@/components/SeeAllLink';
import { toMonthDayYearTwelveHoursFormat } from '@/utils/toMonthDayYearTwelveHoursFormat.util';
import { IoClose } from 'react-icons/io5';
import { useState } from 'react';
import type { ContactRelationStatus } from '@shared/types/contactRelationStatus.type';

const ContactProfile = (): React.JSX.Element => {

  const profile = useProfile();
  const navigate = useNavigate();

  const { user, setters } = profile;

  if (!user) return <Navigate to='/'/>;

  const [contactRelationStatus, setContactRelationStatus] = useState<ContactRelationStatus | null>('CONTACT');

  const userPublicInfos: { label: string, value: string | number }[] = [
    { label: 'Identifier (Id):' , value: 3 },
    { label: 'Username:'        , value: 'Jonau' },
    { label: 'Lumber bucks:'    , value: toLumberBucksFormat(2332) },
    { label: 'Contacts:'        , value: 23 },
    { label: 'Total items:'     , value: 2323 },
    { label: 'Join date'        , value: toMonthDayYearTwelveHoursFormat('2026-11-07T13:59:00.000Z') },
  ];
  
  return (
    <Layout >
      <>
      <ProfileModals profile={profile} />

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

        <div className={styles.main_container}>
          <section className={styles.contact_general_infos_section_container}>
            <button 
            onClick={() => setters.setModal('PROFILE_IMAGE_EXPAND')}
            className={styles.profile_image_inner_container}
            >
              <img 
                className={styles.profile_image}
                src={user?.profileImageURL ?? profileImagePlaceholder} 
                alt={user?.name} 
              />
            </button>

            <div className={styles.contact_descriptive_infos_container}>
              <SectionTitle
                icon={() => <MdOutlinePublic />}
                title='Public infos'
              />

              <div className={styles.dl_contact_actions_container}>
                <dl className={styles.dl}>
                  { userPublicInfos.map((item, index) => {
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
                  {contactRelationStatus === 'CONTACT' ? (
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
                  ) : contactRelationStatus === 'PENDING' ? (
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
                      label='Cancel'
                      icon={() => <IoClose />}
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
                  ) : (
                    <Button
                      buttonStyle='DEFAULT'
                      label='Add contact'
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
              
              { [0,1,0,1,0,1,0,1,0,1].length > 5 && <SeeAllLink to='/contact/3/contacts'/>}       
            </div>

            <nav className={styles.nav}>
              <ul className={styles.ul}>             
                {[0,1,0,1,0,1,0,1,0,1].slice(0, 9).map((index) => (
                  <li 
                  className={styles.li}
                  key={index}
                  >
                    <ContactCard
                      profileImageURL={imgPlaceholder}
                      username='[ Placeholder ]'
                      display='SIMPLE'
                      userId={3}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          <section className={styles.contact_first_6_items_container}>
            <div className={styles.label_see_all_container}>  
              <SectionTitle
                icon={() => <LuBoxes />}
                title='Items'
              />
              
              { [0,1,2,3,4,5].length > 5 && <SeeAllLink to='/contact/3/items'/>}       
            </div>

            <nav className={styles.nav}>
              <ul className={styles.ul}>             
                {[0,1,2,3,4,5].slice(0, 6).map((item, index) => (
                  <li 
                  className={styles.li}
                  key={index}
                  >
                    <ItemNavCard
                      averageMarketPrice={2332}
                      category='BOOK'
                      description={'asdasdads'}
                      originalPrice={2424}
                      name='2323'
                      id={2}
                      imageURL='https://static.wikia.nocookie.net/lumber-tycoon-2/images/6/62/THUMBsinisterplank.png/revision/latest?cb=20220117183539'
                      state='GIFT'
                      units={42}
                      page='HOME/MY_ITEMS'
                    />
                  </li>
                ))}
              </ul>
            </nav>
          </section>
        </div>
      </div>
      </>
    </Layout>
  )
}

export default ContactProfile