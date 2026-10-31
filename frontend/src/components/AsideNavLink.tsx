import React from 'react'
import { Link } from 'react-router-dom'
import styles from './css/AsideNavLink.module.css';
import type { NavLinks } from '@/types/NavLinks.type';
import { FaHome, FaInfoCircle } from 'react-icons/fa';


type Props = {
  to         : `/${string}`;
  label      : string;
  tab        : NavLinks;
  currentTab : NavLinks;
};

const AsideNavLink = (props:Props): React.JSX.Element => {

  const isSelected: boolean = props.tab === props.currentTab;

  const respectiveTabIcon = {
    HOME  : <FaHome/>,
    ABOUT : <FaInfoCircle/>
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
          {props.label}
        </span>
      </Link> 
    </li>
  )
}

export default AsideNavLink