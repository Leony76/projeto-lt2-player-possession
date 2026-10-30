import React from 'react'
import styles from './css/AddItemNavCard.module.css';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

const AddItemNavCard = (): React.JSX.Element => {
  return (
    <Link 
    to={'/item/add'}
    className={styles.container}>
      <div className={styles.inner_container} title='New Item'>
        <div className={styles.icon}>      
          <FaPlus/>
        </div>

        <span className={styles.label}>
          New item
        </span>
      </div>
    </Link>
  )
}

export default AddItemNavCard