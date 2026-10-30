import React from 'react'
import styles from './css/NewContactButton.module.css';
import { FaPlus } from "react-icons/fa6";
import { Link } from 'react-router-dom';

const NewContactButton = (): React.JSX.Element => {
  return (
    <Link 
    to={'/home'}
    className={styles.container}
    >
      <div className={styles.add_image}>
        <FaPlus color='#CC8E69' size={25}/>
      </div>

      <span className={styles.label}>
        Add Contact
      </span>
    </Link>
  )
}

export default NewContactButton