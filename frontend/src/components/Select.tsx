import React, { useState, useEffect, useRef } from 'react'
import styles from './css/Select.module.css';
import { SELECT_CONFIG_MAP, type SelectConfig } from '@/maps/select/selectConfig.map';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { useMouseClickOuttaTargetDiv } from '@/hooks/useMouseClickOuttaTargetDiv.hook';

type Props = {
  selectConfig : SelectConfig;
  onSelect     : (optionKey: string) => void;
  flex        ?: number;
};

const Select = (props:Props): React.JSX.Element => {

  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const OPTIONS_CONFIG = SELECT_CONFIG_MAP[props.selectConfig];

  type OptionKey = keyof typeof OPTIONS_CONFIG;

  const [selectedOption, setSelectedOption] = useState<OptionKey>(
    Object.keys(OPTIONS_CONFIG)[0] as OptionKey
  );

  const { containerRef } = useMouseClickOuttaTargetDiv(setIsOpen);

  return (
    <div 
    ref={containerRef} 
    style={{ flex : props.flex ?? 1 }}
    className={styles.container}
    >
      <button 
      onClick={() => setIsOpen(prev => !prev)}
      data-open={isOpen}
      className={styles.select_container}
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
              setSelectedOption(key as OptionKey);
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