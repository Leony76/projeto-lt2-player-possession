import React from 'react'
import { Link } from 'react-router-dom'
import styles from './css/AsideNavLink.module.css';
import type { NavLinks } from '@/types/navLinks.type';

type Props = {
  to         : `/${string}`;
  label      : string;
  tab        : NavLinks;
  currentTab?: NavLinks;
  icon       : React.ElementType;
  collapsed?: boolean;
};

const AsideNavLink = (props:Props): React.JSX.Element => {

  const isSelected: boolean = props.tab === props.currentTab;

  const Icon = props.icon;

  return (
    <li className={styles.li}> 
      <Link 
        to={props.to} 
         title={props.collapsed ? props.label : undefined} 
        aria-current={isSelected ? 'page' : undefined}
        className={
          isSelected 
          ? styles.selected_link
          : styles.unselected_link
        }
      > 
        <Icon/>
        
        {!props.collapsed && (
          <span>
            { props.label }
          </span>
        )}
      </Link> 
    </li>
  )
}

export default AsideNavLink