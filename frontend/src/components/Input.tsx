import React, { useEffect, useState } from 'react'
import styles from './css/Input.module.css'
import { IoMdEye } from 'react-icons/io';
import ErrorMessage from './ErrorMessage';
import { IoClose } from 'react-icons/io5';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?  : string;
  error?  : string,
  onClear : () => void;
};


const Input = React.forwardRef<HTMLInputElement, Props>(({
  label,
  id,
  type = "text",
  className,
  error,
  onClear,
  onChange,
  value,
  defaultValue,
  ...rest
}, ref): React.JSX.Element => {

  const inputId: string = id ?? React.useId();

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [hasValue, setHasValue] = useState<boolean>();

  useEffect(() => {
    setHasValue(Boolean(value ?? defaultValue));
  }, [value, defaultValue]);

  return (
    <div className={styles.container}>
      {label && (
        <label 
        htmlFor={inputId} 
        className={styles.label}
        >
          {label}
        </label>
      )}

      <div className={styles.input_container}>
        <input
          ref={ref}
          id={inputId}
          className={`${styles.input} ${className ?? ""}`}
          value={value}
          defaultValue={defaultValue}
          onAnimationStart={(e) => {
            if (e.animationName === 'onAutoFillStart') {
              setHasValue(Boolean(e.currentTarget.value));
            }
          }}
          type={type === 'password'
            ? passwordVisible ? 'text' : 'password'
            : type
          }
          onChange={(e) => {
            setHasValue(e.target.value.length > 0);
            onChange?.(e);
          }}
          {...rest}
        />

        {hasValue && (
          <button
          type="button"
          className={styles.clear_icon}
          onClick={() => {
            onClear();
            setHasValue(false);
          }}
          >
            <IoClose />
          </button>
        )}

        {type === 'password' && (
          <button
          type="button"
          className={styles.visibility_icon}
          onClick={() => setPasswordVisible(prev => !prev)}
          >
            <IoMdEye />
          </button>
        )}
      </div>

      {error && <ErrorMessage error={error} />}
    </div>
  );
});


Input.displayName = "Input";

export default Input;

