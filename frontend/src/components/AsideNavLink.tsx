import React from 'react'
import { Link } from 'react-router-dom'
import styles from './css/AsideNavLink.module.css';
import type { NavLinks } from '@/types/navLinks.type';
import { FaBoxOpen, FaHome, FaInfoCircle } from 'react-icons/fa';
import { LuBoxes } from 'react-icons/lu';


type Props = {
  to         : `/${string}`;
  label      : string;
  tab        : NavLinks;
  currentTab?: NavLinks;
};

const AsideNavLink = (props:Props): React.JSX.Element => {

  const isSelected: boolean = props.tab === props.currentTab;

  const respectiveTabIcon: Record<NavLinks, any> = {
    HOME     : <FaHome/>,
    ABOUT    : <FaInfoCircle/>,
    ITEMS    : <LuBoxes />, 
    MY_ITEMS : <FaBoxOpen />
  };

  return (
    <li className={styles.li}> 
      <Link 
        to={props.to} 
        title={props.label}
        aria-current={isSelected ? 'page' : undefined}
        className={
          isSelected 
          ? styles.selected_link
          : styles.unselected_link
        }
      > 
        {respectiveTabIcon[props.tab]}
        <span>
          { props.label }
        </span>
      </Link> 
    </li>
  )
}

export default AsideNavLink