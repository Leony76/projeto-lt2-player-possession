import React, { useState } from 'react'
import styles from './css/Select.module.css';
import { SELECT_CONFIG_MAP, type SelectConfig } from '@/maps/select/selectConfig.map';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { useMouseClickOuttaTargetDiv } from '@/hooks/useMouseClickOuttaTargetDiv.hook';

type Props = {
  selectConfig : SelectConfig;
  value       ?: string;
  onSelect     : (optionKey: string) => void;
  flex        ?: number;
  padding     ?: {
    X?: `${number}px`,
    Y?: `${number}px`, 
  }
};

const Select = (props:Props): React.JSX.Element => {

  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const OPTIONS_CONFIG = SELECT_CONFIG_MAP[props.selectConfig];

  type OptionKey = keyof typeof OPTIONS_CONFIG;

  const [localSelectedOption, setLocalSelectedOption] =
    useState<OptionKey>(
      Object.keys(OPTIONS_CONFIG)[0] as OptionKey
    );

  const selectedOption = (
    props.value ?? localSelectedOption
  ) as OptionKey;

  const { containerRef } = useMouseClickOuttaTargetDiv(setIsOpen);

  return (
    <div 
    ref={containerRef} 
    className={styles.container}
    style={{ 
      flex : props.flex ?? 1,
    }}
    >
      <button 
      onClick={() => setIsOpen(prev => !prev)}
      data-open={isOpen}
      className={styles.select_container}
      style={{
        ...(props.padding?.Y && {
          paddingTop    : props.padding.Y,
          paddingBottom : props.padding.Y,
        }),
        ...(props.padding?.X && {
          paddingRight : props.padding.X,
          paddingLeft  : props.padding.X,
        })
      }}
      >
        <span className={styles.selected_option}>
          { OPTIONS_CONFIG[selectedOption] }
        </span>

        <div className={styles.chevron_down_icon}>
          { isOpen ? <FaCaretUp /> : <FaCaretDown /> }        
        </div>
      </button>

      { isOpen && (
        <div className={styles.options_container}>
          { Object.entries(OPTIONS_CONFIG).map(([key, value]) => (
            <button
            key={key}
            className={styles.option}
            data-selected={selectedOption === key}
            onClick={() => {
              setLocalSelectedOption(key as OptionKey);
              props.onSelect(key);
              setIsOpen(false);
            }}
            >
              { value }
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Select