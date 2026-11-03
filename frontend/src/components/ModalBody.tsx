import React from 'react'
import styles from './css/ModalBody.module.css';
import { IoClose } from 'react-icons/io5';

type Props = {
  children     : React.ReactNode;
  XCloseButton?: boolean;
  title        : string;
  onClose      : () => void;
  gap         ?: `${number}px`
}

const ModalBody = (props:Props): React.JSX.Element => {
  return (
    <div 
    className={styles.modal_overlay}
    onClick={props.onClose}
    >
      <div 
      className={styles.modal_container}
      onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modal_title_x_close_button_container}>
          <h2 className={styles.title}>
            { props.title }
          </h2>

          { props.XCloseButton &&
            <button 
            className={styles.icon}
            onClick={props.onClose}
            >
              <IoClose />
            </button>
          }
        </div>

        <div 
        className={styles.modal_main_body}
        style={{ gap: props.gap }}
        >
          { props.children }
        </div>
      </div>
    </div>
  )
}

export default ModalBody