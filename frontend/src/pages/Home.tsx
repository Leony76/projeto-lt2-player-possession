import React, { useEffect, useState } from 'react';
import styles from './css/Home.module.css';
import { FaHome } from "react-icons/fa";
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import imgPlaceholder from '@/assets/img/placeholder_1.png';
import ContactCard from '@/components/ContactCard';
import AddContactButton from '@/components/AddContactButton';
import ItemNavCard from '@/components/ItemNavCard';
import SeeAllLink from '@/components/SeeAllLink';
import AddItemNavCard from '@/components/AddItemNavCard';
import type { UserItemResponse as UserItems } from '@shared/dtos/item.dto';
import { handleAxiosError } from '@/utils/handleAxiosError.util';
import { ItemService } from '@/services/item.service';
import { ErrorState, LoadingState, NotFoundState } from '@/components/ListStates';

const Home = (): React.JSX.Element => {

  const [items, setItems] = useState<UserItems[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async() => {
      try {
        const items = await ItemService.getUserItemsFromHome();
        
        setItems(items);
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
            <h2 className={styles.label} title={`Contacts (${67})`}>
              Contacts (67)
            </h2>

            <SeeAllLink to='/my-contacts'/>
          </div>

          <nav className={styles.nav}>
            <ul className={styles.ul}>
              <li className={styles.li}>
                <AddContactButton/>
              </li>
              
              {[0,1,2,3,4,5,6,7].map((index) => (
                <li 
                className={styles.li}
                key={index}
                >
                  <ContactCard
                    profileImageURL={imgPlaceholder}
                    username='[ Placeholder ]'
                  />
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <section className={styles.my_items}>
          <div className={styles.label_see_all_container}>
            <h2 className={styles.label} title='My Items'>
              My Items
            </h2>
            
            { items.length > 5 && <SeeAllLink to='/my-items'/>}       
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
              
              {(!loading && !error) && (
                <>
                <li 
                className={styles.li}
                >
                  <AddItemNavCard/>
                </li>
                  
                {items.slice(0, 5).map((item) => (
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
              
              {(!loading && !error && items.length === 0) && (
                <div>
                  <NotFoundState label='Items'/>
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