import React, { useEffect, useState } from 'react';
import styles from './css/Home.module.css';
import { FaHome } from "react-icons/fa";
import Layout from './Layout';
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
import { ErrorState, LoadingState, NotFoundState } from '@/components/ListStates';
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
        const items = await ItemService.getUserItemsFromHome();
        const contacts = await ContactService.getContactsFromHome();
        
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
    <Layout tab='HOME'>
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

            {((contacts?.contacts.length ?? 0) > 9) && <SeeAllLink to='/my-contacts'/>}
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
                <li className={styles.li}>
                  <AddContactButton/>
                </li>

                {contacts.contacts.map((contact) => (
                  
                  <li 
                  className={styles.li}
                  key={contact.id}
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

              {(!loading && !error && contacts?.contacts.length === 0) && (
                <div>
                  <NotFoundState label='contacts'/>
                </div>
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
                <li 
                className={styles.li}
                >
                  <AddItemNavCard/>
                </li>
                  
                {items.items.slice(0, 5).map((item) => (
                  <li 
                  className={styles.li}
                  key={item.id}
                  >
                    <ItemNavCard
                      page='HOME/MY_ITEMS'
                      { ...item }
                    />
                  </li>
                ))}
                </>
              )}
              
              {(!loading && !error && items?.items.length === 0) && (
                <div>
                  <NotFoundState label='items'/>
                </div>
              )}
            </ul>
          </nav>
        </section>
      </div>
    </Layout>
  )
}

export default Home