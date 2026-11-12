import React from 'react'
import styles from './css/IncrementDecrementButtons.module.css';
import { FaMinus, FaPlus } from 'react-icons/fa';

type Props = {
  onIncrement: () => void;
  onDecrement: () => void;
  scale     ?: number;
};

const IncrementDecrementButtons = (props:Props): React.JSX.Element => {

  return (
    <div 
    className={styles.increment_decrement_container}
    style={{ scale: props.scale ?? 1 }}
    >
      <button 
      className={styles.decrement} 
      onClick={props.onDecrement}
      title='Subtract Unit'
      >
        <FaMinus />
      </button>
      
      <div className={styles.division_line}/>

      <button 
      className={styles.increment} 
      onClick={props.onIncrement}
      title='Add Unit'
      >
        <FaPlus />
      </button>
    </div>
  )
}

export default IncrementDecrementButtons