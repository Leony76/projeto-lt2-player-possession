import React, { useEffect, useState } from 'react';
import styles from './css/Home.module.css';
import animations from '@assets/css/Animations.module.css';
import { FaHome } from "react-icons/fa";
import PageTitle from '@/components/PageTitle';
import imgPlaceholder from '@/assets/img/profile_image_placeholder.png';
import ContactCard from '@/components/ContactCard';
import AddContactButton from '@/components/AddContactButton';
import ItemNavCard from '@/components/ItemNavCard';
import SeeAllLink from '@/components/SeeAllLink';
import AddItemNavCard from '@/components/AddItemNavCard';
import type { UserItemFromHomeResponse as UserItem } from '@shared/dtos/item.dto';
import { handleAxiosError } from '@/utils/handleAxiosError.util';
import { ItemService } from '@/services/item.service';
import { ErrorState, LoadingState } from '@/components/ListStates';
import SectionTitle from '@/components/SectionTitle';
import { BiSolidContact } from 'react-icons/bi';
import { LuBoxes } from 'react-icons/lu';
import { ContactService } from '@/services/contact.service';
import type { ContactFromHomeResponse as UserContact } from '@shared/dtos/contact.dto'; 

const Home = (): React.JSX.Element => {

  const [items, setItems] = useState<UserItem | null>(null);
  const [contacts, setContacts] = useState<UserContact | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async() => {
      try {
        const [items, contacts] = await Promise.all([
          ItemService.getUserItemsFromHome(),
          ContactService.getContactsFromHome()
        ]);
        
        setItems(items);
        setContacts(contacts);
      } catch (error:unknown) {
        setError(handleAxiosError(error));
      } finally {
        setLoading(false);
      }
    })();
  },[]);

  return (
    <div className={styles.container}>
      <PageTitle
        Icon={() => <FaHome/>}
        title='Home'
      />
    
      <section className={styles.contacts}>
        <div className={styles.label_see_all_container}>
          <SectionTitle
            title={`My Contacts (${contacts?.totalContacts ?? '?'})`}
            icon={() => <BiSolidContact />}
            size='21px'
          />

          {((contacts?.contacts.length ?? 0) > 8) && <SeeAllLink to='/my-contacts'/>}
        </div>

        <nav className={styles.nav}>
          <ul className={styles.ul}>  
            {loading && (
              <div>
                <LoadingState label='Contacts'/>
              </div>
            )}
            
            {(!loading && error) && (
              <div>
                <ErrorState error={error}/>
              </div>
            )} 
            
            {(!loading && !error && contacts) && (
              <>
              <li className={`${styles.li} ${animations.fade_in}`}>
                <AddContactButton />
              </li>

              {contacts.contacts.slice(0, 8).map((contact, index) => (               
                <li 
                key={contact.id}
                className={`${styles.li} ${animations.fade_in}`}
                style={{ animationDelay: `${index * 80}ms` }}
                >
                  <ContactCard
                    display='SIMPLE'
                    profileImageURL={contact.profileImageURL || imgPlaceholder}
                    username={contact.name}
                    userId={contact.id}
                  />
                </li>
              ))}
              </>
            )}
          </ul>
        </nav>
      </section>

      <section className={styles.my_items}>
        <div className={styles.label_see_all_container}>
          <SectionTitle
            icon={() => <LuBoxes/>}
            title={`My Items (${items?.totalItems ?? '?'})`}
            size='21px'
          />
          
          {(items?.items.length ?? 0) > 5 && <SeeAllLink to='/my-items'/>}       
        </div>

        <nav className={styles.nav}>
          <ul className={styles.ul}>
            {loading && (
              <div>
                <LoadingState label='Items'/>
              </div>
            )}
            
            {(!loading && error) && (
              <div>
                <ErrorState error={error}/>
              </div>
            )} 
            
            {(!loading && !error && items?.items) && (
              <>
              <li className={`${styles.li} ${animations.fade_in}`}>
                <AddItemNavCard />
              </li>
                
              {items.items.slice(0, 5).map((item, index) => (
                <li
                key={item.id}
                className={`${styles.li} ${animations.fade_in}`}
                style={{ animationDelay: `${index * 80}ms` }}
                >
                  <ItemNavCard
                    page="HOME/USER_ITEMS"
                    {...item}
                  />
                </li>
              ))}
              </>
            )}
          </ul>
        </nav>
      </section>
    </div>
  )
}

export default Home