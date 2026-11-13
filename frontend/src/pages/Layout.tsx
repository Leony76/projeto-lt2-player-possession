import React, { useEffect, useState } from 'react';
import fireAxe from '@public/fire_axe_decal.webp';
import styles from './css/Layout.module.css';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
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
import { handleAxiosError } from '@/utils/handleAxiosError.util';
import { ContactService } from '@/services/contact.service';


const Layout = (): React.JSX.Element => {

  const { user, signOut, loading } = useAuth();

  const location = useLocation();

  const [isAsideCollapsed, setIsAsideCollapsed] = useState<boolean>(false);

  const [receivedContactRequestsCount, setReceivedContactRequestsCount] = useState<number>(0);

  const currentTab = {
    '/home'        : 'HOME',
    '/items'       : 'ITEMS',
    '/my-items'    : 'MY_ITEMS',
    '/contacts'    : 'CONTACTS',
    '/my-contacts' : 'MY_CONTACTS',
    '/about'       : 'ABOUT',
  } as const;

  const tab = currentTab[location.pathname as keyof typeof currentTab];
  const iconSizeByCollapedStatus = isAsideCollapsed ? 1.4 : 1;

  const navLinksConfig: {
    to         : `/${string}`;
    label      : string;
    tab        : NavLinks;
    currentTab : NavLinks | undefined;
    icon       : React.ElementType;
    badgeCount?: number;
  }[] = [
    {
      to         : '/home',
      label      : 'Home',
      tab        : 'HOME',
      currentTab : tab,
      icon       : () => <FaHome style={{ scale: iconSizeByCollapedStatus }}/>
    },
    {
      to         : '/items',
      label      : 'Items',
      tab        : 'ITEMS',
      currentTab : tab,
      icon       : () => <LuBoxes style={{ scale: iconSizeByCollapedStatus }}/>
    },
    {
      to         : '/my-items',
      label      : 'My items',
      tab        : 'MY_ITEMS',
      currentTab : tab,
      icon       : () => <FaBoxOpen style={{ scale: iconSizeByCollapedStatus }}/>
    },
    {
      to         : '/contacts',
      label      : 'Contacts',
      tab        : 'CONTACTS',
      currentTab : tab,
      icon       : () => <IoMdContact style={{ scale: iconSizeByCollapedStatus }}/>
    },
    {
      to         : '/my-contacts',
      label      : 'My Contacts',
      tab        : 'MY_CONTACTS',
      currentTab : tab,
      icon       : () => <BiSolidContact style={{ scale: iconSizeByCollapedStatus }}/>,
      badgeCount : receivedContactRequestsCount,
    },
    {
      to         : '/about',
      label      : 'About',
      tab        : 'ABOUT',
      currentTab : tab,
      icon       : () => <FaInfoCircle style={{ scale: iconSizeByCollapedStatus }}/>
    },
  ];

  const decrementReceivedContactRequestsCount = (): void => {
    setReceivedContactRequestsCount(prev => Math.max(0, prev - 1));
  };

  useEffect(() => {
    if (!user) return;

    const savedPreference = localStorage.getItem(
      `asideCollapsed_${user.id}`
    );

    setIsAsideCollapsed(savedPreference === 'true');

  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    localStorage.setItem(
      `asideCollapsed_${user.id}`, 
      String(isAsideCollapsed)
    );

  }, [isAsideCollapsed, user?.id]);

  useEffect(() => {
    if (!user) return;

    const getReceivedRequestsCount = async () => {
      try {
        const response = await ContactService.getReceivedContactRequestsCount();

        setReceivedContactRequestsCount(response.count);

      } catch (error:unknown) {
        console.error(handleAxiosError(error));
      }
    };

    getReceivedRequestsCount();

    const interval = setInterval(getReceivedRequestsCount, 30000);

    return () => clearInterval(interval);
  }, [user?.id]);

  if (loading) return <PageLoading/>;
  if (!user) return <Navigate to={'/'}/>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <figure 
        title="LT2 Player's Possession"
        className={styles.logo_site_title_container}
        >
          <img 
            src={fireAxe} 
            className={styles.logo}
            alt="LT2 Player's Possession"
          />
  
          <figcaption className={styles.site_title}>
            LT2 Player's Possession
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
            style={{ width: '38px', alignSelf: 'center'}}
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
            <Outlet context={{
              decrementReceivedContactRequestsCount,
            }}/>
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