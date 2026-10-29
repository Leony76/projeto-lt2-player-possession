import React from 'react'
import styles from './css/Input.module.css'

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,"type"
> & {
  label? : string;
  type?  : React.HTMLInputTypeAttribute;
};

const Input = ({
  label,
  id,
  type = "text",
  className,
  ...rest
}: Props): React.JSX.Element => {

  const inputId: string = id ?? React.useId();

  return (
    <div className={styles.container}>

      { label && (
        <label 
        htmlFor={inputId}
        className={styles.label}
        >
          { label }
        </label>
      )}

      <input 
        { ...rest }
        id={inputId}
        type={type}
        className={`
          ${styles.input} 
          ${className ?? ""}
        `}
      />
    </div>
  )
}

export default Input