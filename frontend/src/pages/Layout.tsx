import React from 'react';
import fireAxe from '@public/fire_axe_decal.webp';
import styles from './css/Layout.module.css';
import { Link, Navigate, redirect } from 'react-router-dom';
import { MdLogout } from "react-icons/md";
import type { NavLinks } from '@/types/NavLinks.type';
import AsideNavLink from '@/components/AsideNavLink';
import imgPlaceholder3 from '@/assets/img/placeholder_3.png'
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat.util';
import { FaWallet } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  children: React.ReactNode;
  tab: NavLinks;
};

const Layout = (props:Props): React.JSX.Element => {

  const { user, signOut } = useAuth();

  if (!user) return <Navigate to={'/'}/>;

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
                  { toLumberBucksFormat(user.lumberBucks) }
                </span>
              </button>
            </li>

            <li className={styles.li}>
              <Link 
              title='Profile'
              to={'/profile'}
              className={styles.logged_user_username_profile_image_container}>
                <span className={styles.username}>
                  {user.name}
                </span>

                <figure className={styles.logged_user_profile_image_container}>
                  <img 
                    className={styles.profile_image}
                    src={user.profileImageURL ?? 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Portrait_Placeholder.png/250px-Portrait_Placeholder.png?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=thumbnail'} 
                    alt={user.name} 
                  />
                </figure>
              </Link>
            </li>

            <li className={styles.li}> 
              <button 
              title='Sign Out'
              className={`${styles.signout}`}
              onClick={signOut}
              > 
                <MdLogout size={20}/>
              </button> 
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