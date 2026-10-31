import React from 'react'
import styles from './css/ErrorMessage.module.css';
import { MdError } from 'react-icons/md';

const ErrorMessage = ({ error }: { error:string }): React.JSX.Element => {
  return (
    <div className={styles.error}>
      <div className={styles.icon}>
        <MdError />
      </div>

      <span className={styles.label}>
        { error }
      </span>
    </div>
  )
}

export default ErrorMessage