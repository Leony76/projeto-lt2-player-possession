import React from 'react';
import styles from './css/Button.module.css';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

const Button = ({
  label,
  type = "button",
  disabled,
  ...rest
}: Props): React.JSX.Element => {
  return (
    <button 
      type={type} 
      disabled={disabled}
      className={styles.container} 
      {...rest} 
    >
      <span className={styles.label}>
        {label}
      </span>
    </button>
  );
};

export default Button;