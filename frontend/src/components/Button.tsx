import React from 'react';
import styles from './css/Button.module.css';

type Props = {
  label: string;
};

const Button = ({
  label
}: Props): React.JSX.Element => {
  return (
    <button className={styles.container}>
      <span className={styles.label}>
        { label }
      </span>
    </button>
  )
}

export default Button