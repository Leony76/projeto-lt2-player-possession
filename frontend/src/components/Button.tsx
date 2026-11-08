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
  };

  colors     ?: {
    labelBorder : string;
    background  : string;
  };

  brightness ?: {
    hover ?: number;
    active?: number;
  };

  iconPosition?: {
    top    ?: `${number}px`;
    bottom ?: `${number}px`;
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
  iconPosition,
  brightness,
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
    disabled={loading || disabled}
    className={`
      ${styleComposition[buttonStyle].containerStyle} 
      ${(disabled || loading) && styles.disabled}
    `} 
    style={{ 
      borderColor     : colors?.labelBorder,
      backgroundColor : colors?.background,

      '--hover-brightness'  : brightness?.hover ?? 0.95,
      '--active-brightness' : brightness?.active ?? 0.90,

      '--icon-margin-bottom' : iconPosition?.bottom ?? 0,
      '--icon-margin-top'    : iconPosition?.top ?? 0,

      ...(padding && { 
        padding: `${padding.Y ?? '0px'} ${padding.X ?? '0px'}` 
      })
    } as React.CSSProperties }
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