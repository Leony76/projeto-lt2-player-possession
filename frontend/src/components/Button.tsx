import React from 'react';
import styles from './css/Button.module.css';

type ButtonStyle = 'FORM' | 'DEFAULT';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label       : string;
  buttonStyle : ButtonStyle;
  icon       ?: React.ElementType;
};

const Button = ({
  label,
  buttonStyle,
  icon,
  type = "button",
  disabled,
  ...rest
}: Props): React.JSX.Element => {

  const Icon = icon;

  const styleComposition: Record<ButtonStyle, string> = {
    DEFAULT : styles.container_default_style,
    FORM    : styles.container_form_style,
  };

  return (
    <button 
      type={type} 
      disabled={disabled}
      className={styleComposition[buttonStyle]} 
      {...rest} 
    >
      { icon && Icon && (
        <div className={styles.icon}>
          <Icon/>
        </div>
      )}

      <span className={styles.label}>
        {label}
      </span>
    </button>
  );
};

export default Button;