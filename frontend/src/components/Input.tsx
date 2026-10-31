import React, { useState } from 'react'
import styles from './css/Input.module.css'
import { MdError } from 'react-icons/md';
import { IoMdEye } from 'react-icons/io';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string,
};

const Input = React.forwardRef<HTMLInputElement, Props>(({
  label,
  id,
  type = "text",
  className,
  error,
  ...rest
}, ref): React.JSX.Element => {

  const inputId: string = id ?? React.useId();
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.input_container}>
        <input 
          ref={ref} 
          id={inputId}
          type={
            type === 'password' 
            ? passwordVisible 
              ? 'text' 
              : 'password' 
            : type
          }
          className={`
            ${styles.input} 
            ${className ?? ""}
          `}
          {...rest} 
        />

        { type === 'password' &&
          <button 
          type='button' 
          className={styles.visibility_icon}
          onClick={() => setPasswordVisible(prev => !prev)}
          >
            <IoMdEye />
          </button>
        }
      </div>

      { error &&
        <span className={styles.error}>
          <div className={styles.icon}>
            <MdError />
          </div>

          <span className={styles.label}>
            { error }
          </span>
        </span>
      }
    </div>
  );
});

Input.displayName = "Input";

export default Input;

