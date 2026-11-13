import React, { useEffect, useState } from 'react';
import fireAxe from '@public/fire_axe_decal.webp';
import styles from './css/Layout.module.css';
import { Link, Navigate } from 'react-router-dom';
import { MdLogout } from "react-icons/md";
import type { NavLinks } from '@/types/navLinks.type';
import AsideNavLink from '@/components/AsideNavLink';
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat.util';
import { FaBoxOpen, FaHome, FaInfoCircle, FaWallet } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import PageLoading from '@/components/PageLoading';
import profileImagePlaceholder from '@/assets/img/profile_image_placeholder.png';
import { LuBoxes } from 'react-icons/lu';
import { IoMdContact } from 'react-icons/io';
import { BiSolidContact } from 'react-icons/bi';
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from 'react-icons/md';

type Props = {
  children : React.ReactNode;
  tab     ?: NavLinks;
};

const Layout = (props:Props): React.JSX.Element => {

  const { user, signOut, loading } = useAuth();

  const [isAsideCollapsed, setIsAsideCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('asideCollapsed') === 'true';
  });

  if (loading) return <PageLoading/>;

  if (!user) return <Navigate to={'/'}/>;

  const navLinksConfig: {
    to         : `/${string}`;
    label      : string;
    tab        : NavLinks;
    currentTab : NavLinks | undefined;
    icon       : React.ElementType;
  }[] = [
    {
      to         : '/home',
      label      : 'Home',
      tab        : 'HOME',
      currentTab : props.tab,
      icon       : () => <FaHome/>
    },
    {
      to         : '/items',
      label      : 'Items',
      tab        : 'ITEMS',
      currentTab : props.tab,
      icon       : () => <LuBoxes />
    },
    {
      to         : '/my-items',
      label      : 'My items',
      tab        : 'MY_ITEMS',
      currentTab : props.tab,
      icon       : () => <FaBoxOpen />
    },
    {
      to         : '/contacts',
      label      : 'Contacts',
      tab        : 'CONTACTS',
      currentTab : props.tab,
      icon       : () => <IoMdContact />
    },
    {
      to         : '/my-contacts',
      label      : 'My Contacts',
      tab        : 'MY_CONTACTS',
      currentTab : props.tab,
      icon       : () => <BiSolidContact />
    },
    {
      to         : '/about',
      label      : 'About',
      tab        : 'ABOUT',
      currentTab : props.tab,
      icon       : () => <FaInfoCircle/>
    },
  ];

  useEffect(() => {
    localStorage.setItem('asideCollapsed', String(isAsideCollapsed));
  }, [isAsideCollapsed]);

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
            <li 
            title='Lumber Bucks'
            className={`
              ${styles.li}
              ${styles.user_lumber_bucks_container}
            `}
            >
              <div className={styles.icon}>
                <FaWallet />
              </div>

              <span className={styles.lumber_bucks}>
                { toLumberBucksFormat(user.lumberBucks) }
              </span>
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
                    src={user.profileImageURL ?? profileImagePlaceholder} 
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
      
      <div className={`
        ${styles.main_footer_aside}
        ${isAsideCollapsed ? styles.collapsed : ''}
      `}>
        <aside className={styles.aside}>
          {isAsideCollapsed &&
            <button
            type="button"
            data-is-collapsed={isAsideCollapsed}
            title={isAsideCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isAsideCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isAsideCollapsed}
            className={styles.aside_toggle_button}
            onClick={() => setIsAsideCollapsed(prev => !prev)}
            >
              {isAsideCollapsed
                ? <MdKeyboardDoubleArrowRight />
                : <MdKeyboardDoubleArrowLeft />
              }
            </button>
          }

          <nav className={styles.nav}>
            <ul className={styles.ul}>
              {navLinksConfig.map((item, index) => (
                <div
                className={styles.collapse_button_aside_links_container}
                key={item.to}
                >
                  <AsideNavLink                 
                    {...item}
                    collapsed={isAsideCollapsed}
                  />

                  {!isAsideCollapsed && index === 0 &&
                    <button
                    type="button"
                    title={isAsideCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-label={isAsideCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-expanded={!isAsideCollapsed}               
                    className={styles.aside_toggle_button}
                    onClick={() => setIsAsideCollapsed(prev => !prev)}
                    >
                      {isAsideCollapsed
                        ? <MdKeyboardDoubleArrowRight />
                        : <MdKeyboardDoubleArrowLeft />
                      }
                    </button>
                  }
                </div>
              ))}
            </ul>
          </nav>

        </aside>

        <div className={styles.main_footer}>
          <main className={styles.main}>
            {props.children}
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