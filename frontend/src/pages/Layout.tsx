import React from 'react';
import fireAxe from '@public/fire_axe_decal.webp';
import styles from './css/Layout.module.css';
import { Link } from 'react-router-dom';
import { MdLogout } from "react-icons/md";

type Props = {
  children: React.ReactNode;
  tab: 'HOME' | 'ABOUT';
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
      </header>
      
      <div className={styles.main_aside}>
        <aside className={styles.aside}>
          <nav className={styles.nav}>
            <ul className={styles.ul}>
              <li className={styles.li}> 
                <Link to={'/home'} className={
                  props.tab === 'HOME' 
                  ? styles.selected_link
                  : styles.unselected_link
                }> 
                  Home 
                </Link> 
              </li>

              <li className={styles.li}> 
                <Link to={'/about'} className={
                  props.tab === 'ABOUT' 
                  ? styles.selected_link
                  : styles.unselected_link
                }> 
                  About 
                </Link> 
              </li>
              
              <li className={`${styles.li} ${styles.li_logout}`}> 
                <Link to={'/'} className={styles.unselected_link}> 
                  <MdLogout size={20}/> 
                </Link> 
              </li>
            </ul>
          </nav>
        </aside>

        <main className={styles.main}>
          { props.children }
        </main>
      </div>


      <footer className={styles.footer}>
        <span className={styles.copyright}>
          &copy; 2026 Leony Leandro Barros, All Rights Reserved
        </span>
      </footer>
    </div>
  )
}

export default Layout