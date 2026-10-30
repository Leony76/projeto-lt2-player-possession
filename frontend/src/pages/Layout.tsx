import React from 'react';
import fireAxe from '@public/fire_axe_decal.webp';
import styles from './css/Layout.module.css';
import { Link } from 'react-router-dom';
import { MdLogout } from "react-icons/md";
import type { NavLinks } from '@/types/NavLinks';
import AsideNavLink from '@/components/AsideNavLink';
import imgPlaceholder3 from '@/assets/img/placeholder_3.png'
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat';
import { FaWallet } from 'react-icons/fa';

type Props = {
  children: React.ReactNode;
  tab: NavLinks;
};

const Layout = (props:Props): React.JSX.Element => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <figure 
        title="Player's Possession"
        className={styles.logo_site_title_container}
        >
          <img 
            src={fireAxe} 
            className={styles.logo}
            alt="Player's Possession"
          />
  
          <figcaption className={styles.site_title}>
            Player's Possession
          </figcaption>
        </figure>

        <nav className={styles.nav}>
          <ul className={styles.ul}>
            <li className={styles.li}>
              <button     
              title='Lumber Bucks'      
              onClick={() => {}}
              type='button'
              className={styles.user_lumber_bucks_container}
              >
                <div className={styles.icon}>
                  <FaWallet />
                </div>

                <span className={styles.lumber_bucks}>
                  { toLumberBucksFormat(7823123) }
                </span>
              </button>
            </li>

            <li className={styles.li}>
              <Link 
              title='Profile'
              to={'/profile'}
              className={styles.logged_user_username_profile_image_container}>
                <span className={styles.username}>
                  {'Nika jasndklsan sadjnasjkdn saldkjnaslkdjnalksdnjsdj'}
                </span>

                <figure className={styles.logged_user_profile_image_container}>
                  <img 
                    className={styles.profile_image}
                    src={imgPlaceholder3} 
                    alt={'Nika'} 
                  />
                </figure>
              </Link>
            </li>

            <li className={styles.li}> 
              <Link 
              title='Sign Out'
              to={'/'} 
              className={`${styles.signout}`}
              > 
                <MdLogout size={20}/>
              </Link> 
            </li>
          </ul>
        </nav>
      </header>
      
      <div className={styles.main_footer_aside}>
        <aside className={styles.aside}>
          <nav className={styles.nav}>
            <ul className={styles.ul}>
              <AsideNavLink
                to='/home'
                label='Home'
                tab='HOME'
                currentTab={props.tab}
              />
              
              <AsideNavLink
                to='/about'
                label='About'
                tab='ABOUT'
                currentTab={props.tab}
              />
            </ul>
          </nav>
        </aside>
        
        <div className={styles.main_footer}>
          <main className={styles.main}>
            { props.children }
          </main>

          <footer className={styles.footer}>
            <span className={styles.copyright}>
              &copy; 2026 Leony Leandro Barros, All Rights Reserved
            </span>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default Layout