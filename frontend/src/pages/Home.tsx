import React from 'react';
import styles from './css/Home.module.css';
import { FaHome } from "react-icons/fa";
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import imgPlaceholder from '@/assets/img/placeholder_1.png';
import imgPlaceholder2 from '@/assets/img/placeholder_2.png';
import ContactCard from '@/components/ContactCard';
import NewContactButton from '@/components/NewContactButton';
import { FaArrowRight } from "react-icons/fa";
import { Link } from 'react-router-dom';
import ItemNavCard from '@/components/ItemNavCard';
import SeeAllLink from '@/components/SeeAllLink';

const Home = (): React.JSX.Element => {
  return (
    <Layout tab='HOME'>
      <div className={styles.container}>
        <PageTitle
          Icon={() => <FaHome/>}
          title='Home'
        />
      
        <section className={styles.contacts}>
          <div className={styles.label_see_all_container}>
            <h2 className={styles.label}>
              Contacts (67)
            </h2>

            <SeeAllLink to='/home'/>
          </div>

          <nav className={styles.nav}>
            <ul className={styles.ul}>
              <li className={styles.li}>
                <NewContactButton/>
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
            <h2 className={styles.label}>
              My Items
            </h2>

            <SeeAllLink to='/home'/>
          </div>

          <nav className={styles.nav}>
            <ul className={styles.ul}>
              {[0,1].map((index) => (
                <li 
                className={styles.li}
                key={index}
                >
                  <ItemNavCard
                    id={12}
                    imageURL={imgPlaceholder2}
                    name={'Maria bonita de la aprma'}
                    category={'LOOSE'}
                    subcategory={'PLANK'}
                    description={'"She\'s just bealtiful sadasd dxasd asdas"'}
                    originalPrice={69000}
                    marketPrice={690000}
                    units={1}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </section>
      </div>
    </Layout>
  )
}

export default Home