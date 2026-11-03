import React from 'react';
import styles from './css/Button.module.css';
import LoadingSpinner from './LoadingSpinner';

type ButtonStyle = 'FORM' | 'DEFAULT';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label       : string;
  buttonStyle : ButtonStyle;
  icon       ?: React.ElementType;
  iconSize   ?: number;
  loading    ?: boolean;
  padding    ?: {
    X?: `${number}px`;
    Y?: `${number}px`;
  },
  colors     ?: {
    labelBorder : string;
    background  : string;
  }
};

const Button = ({
  label,
  buttonStyle,
  icon,
  colors,
  padding,
  iconSize,
  loading,
  type = "button",
  disabled,
  ...rest
}: Props): React.JSX.Element => {

  const Icon = icon;

  const styleComposition: Record<ButtonStyle, { 
    containerStyle : string; 
    spinnerColor   : string 
  }> = {
    DEFAULT: { 
      containerStyle : styles.container_default_style, 
      spinnerColor   : colors?.labelBorder ?? '#98785F' 
    },
    FORM: { 
      containerStyle : styles.container_form_style, 
      spinnerColor   : colors?.labelBorder ?? '#EAB892' 
    },
  };

  return (
    <button 
    type={type} 
    disabled={disabled}
    className={`
      ${styleComposition[buttonStyle].containerStyle} 
      ${disabled && styles.disabled}
    `} 
    style={{ 
      borderColor     : colors?.labelBorder,
      backgroundColor : colors?.background,
      ...(padding && { 
        padding: `${padding.Y ?? '0px'} ${padding.X ?? '0px'}` 
      })
    }}
    {...rest} 
    >
      { loading ? (
        <LoadingSpinner 
          size={16} 
          color={styleComposition[buttonStyle].spinnerColor}
        />
      ) : (
        icon && Icon && (
          <div 
          className={styles.icon}
          style={{ 
            fontSize : iconSize ?? '16px',
            color    : colors?.labelBorder
          }}
          >
            <Icon />
          </div>
        )
      )}

      <span 
      className={styles.label}
      style={{ color: colors?.labelBorder }}
      >
        { label }
      </span>
    </button>
  );
};

export default Button;