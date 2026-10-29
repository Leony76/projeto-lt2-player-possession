import React from 'react';
import fireAxe from '@public/fire_axe_decal.webp';
import styles from './css/Layout.module.css';
import { Link } from 'react-router-dom';
import { MdLogout } from "react-icons/md";
import type { NavLinks } from '@/types/NavLinks';
import AsideNavLink from '@/components/AsideNavLink';

type Props = {
  children: React.ReactNode;
  tab: NavLinks;
};

const Layout = (props:Props): React.JSX.Element => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo_site_title_container}>
          <img 
            src={fireAxe} 
            className={styles.logo}
            alt="Player's Possession"
          />
  
          <span className={styles.site_title}>
            Player's Possession
          </span>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.ul}>
            <li className={styles.li}> 
              <Link to={'/'} className={`${styles.link}`}> 
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