import React from 'react'
import styles from './css/AddContactButton.module.css';
import { FaPlus } from "react-icons/fa6";
import { Link } from 'react-router-dom';

const AddContactButton = (): React.JSX.Element => {
  return (
    <Link 
    to={'/contact/add'}
    className={styles.container}
    title='New Contact'
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

export default AddContactButton