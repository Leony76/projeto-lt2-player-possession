import React from 'react'
import styles from './css/ErrorMessage.module.css';
import { MdError } from 'react-icons/md';

type Props = {
  error: string;
  hasBackgroundContrast?: boolean;
};

const ErrorMessage = ({ error, hasBackgroundContrast }: Props): React.JSX.Element => {
  return (
    <div 
    title='Error message'
    className={styles.error}
    style={{ ...(hasBackgroundContrast && { backgroundColor: 'rgb(255, 211, 211)' }) }}
    >
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