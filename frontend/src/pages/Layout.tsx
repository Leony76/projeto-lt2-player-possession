import fireAxe from '@public/fire_axe_decal.webp';
import styles from './css/Layout.module.css';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { MdLogout, MdMessage } from "react-icons/md";
import type { NavLinks } from '@/types/navLinks.type';
import AsideNavLink from '@/components/AsideNavLink';
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat.util';
import { FaBoxOpen, FaHome, FaInfoCircle, FaWallet } from 'react-icons/fa';
import PageLoading from '@/components/PageLoading';
import profileImagePlaceholder from '@/assets/img/profile_image_placeholder.png';
import { LuBoxes } from 'react-icons/lu';
import { IoMdContact } from 'react-icons/io';
import { BiSolidContact } from 'react-icons/bi';
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from 'react-icons/md';
import { MessageChat } from '@/components/modals/MessageChat';
import { useLayout } from '@/hooks/pages/useLayout.hook';

const Layout = (): React.JSX.Element => {

  const { states, setters, user, handlers, signOut } = useLayout();

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
      currentTab : states.tab,
      icon       : () => <FaHome style={{ scale: states.iconSizeByCollapedStatus }}/>
    },
    {
      to         : '/items',
      label      : 'Items',
      tab        : 'ITEMS',
      currentTab : states.tab,
      icon       : () => <LuBoxes style={{ scale: states.iconSizeByCollapedStatus }}/>
    },
    {
      to         : '/my-items',
      label      : 'My items',
      tab        : 'MY_ITEMS',
      currentTab : states.tab,
      icon       : () => <FaBoxOpen style={{ scale: states.iconSizeByCollapedStatus }}/>
    },
    {
      to         : '/contacts',
      label      : 'Contacts',
      tab        : 'CONTACTS',
      currentTab : states.tab,
      icon       : () => <IoMdContact style={{ scale: states.iconSizeByCollapedStatus }}/>
    },
    {
      to         : '/my-contacts',
      label      : 'My Contacts',
      tab        : 'MY_CONTACTS',
      currentTab : states.tab,
      icon       : () => <BiSolidContact style={{ scale: states.iconSizeByCollapedStatus }}/>,
      badgeCount : states.receivedContactRequestsCount,
    },
    {
      to         : '/about',
      label      : 'About',
      tab        : 'ABOUT',
      currentTab : states.tab,
      icon       : () => <FaInfoCircle style={{ scale: states.iconSizeByCollapedStatus }}/>
    },
  ];


  if (states.loading) return <PageLoading/>;
  if (!user) return <Navigate to={'/'}/>;

  return (
    <>
    {states.isMessageChatOpen && (
      <MessageChat
        initialContact={states.initialChatContact}
        isMinimized={states.isMessageChatMinimized}
        closeChat={handlers.handleCloseMessageChat}
        setIsMinimized={setters.setIsMessageChatMinimized}
      />
    )}

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
            
            {!states.isMessageChatOpen &&
              <li className={`${styles.li} ${styles.message_chat_li}`}>
                <button 
                className={styles.open_message_chat}
                onClick={() => setters.setIsChatMessageOpen(true)}
                >
                  <MdMessage size={20}/>

                  {states.unreadMessagesCount > 0 && 
                    <span title={`${states.unreadMessagesCount} unread messages`}>
                      {states.unreadMessagesCount > 99
                        ? '99+'
                        : states.unreadMessagesCount
                      }
                    </span>
                  }
                </button>
              </li>
            }

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
        ${states.isAsideCollapsed ? styles.collapsed : ''}
      `}>
        <aside className={styles.aside}>
          {states.isAsideCollapsed &&
            <button
            type="button"
            data-is-collapsed={states.isAsideCollapsed}
            style={{ width: '38px', alignSelf: 'center'}}
            title={states.isAsideCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={states.isAsideCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!states.isAsideCollapsed}
            className={styles.aside_toggle_button}
            onClick={() => setters.setIsAsideCollapsed(prev => !prev)}
            >
              {states.isAsideCollapsed
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
                    collapsed={states.isAsideCollapsed}
                  />

                  {!states.isAsideCollapsed && index === 0 &&
                    <button
                    type="button"
                    title={states.isAsideCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-label={states.isAsideCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-expanded={!states.isAsideCollapsed}               
                    className={styles.aside_toggle_button}
                    onClick={() => setters.setIsAsideCollapsed(prev => !prev)}
                    >
                      {states.isAsideCollapsed
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
              decrementReceivedContactRequestsCount : handlers.decrementReceivedContactRequestsCount,
              openConversationWithContact : handlers.openConversationWithContact,
              openCloseMessageChat        : handlers.openCloseMessageChat,
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
    </>
  )
}

export default Layout