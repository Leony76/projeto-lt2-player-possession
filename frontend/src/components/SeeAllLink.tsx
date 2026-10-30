import React from 'react'
import styles from './css/SeeAllLink.module.css';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

type Props = {
  to: `/${string}`;
};

const SeeAllLink = (props:Props): React.JSX.Element => {
  return (
    <Link 
    to={props.to} 
    className={styles.see_all_container}
    >
      <span className={styles.label}>
        See All
      </span>

      <FaArrowRight color='#CC8E69'/>
    </Link>
  )
}

export default SeeAllLink