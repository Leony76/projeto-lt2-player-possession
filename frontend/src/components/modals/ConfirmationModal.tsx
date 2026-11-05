import React from 'react'
import styles from '../css/ConfirmationModal.module.css';
import ModalBody from './ModalBody';
import Button from '../Button';
import { FaCheckCircle } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';

type Props = {
  onConfirm : () => void;
  onCancel  : () => void;
  message   : string;
  loading   : boolean;
};

const ConfirmationModal = (props:Props): React.JSX.Element => {
  return (
    <ModalBody
    onClose={!props.loading ? props.onCancel : () => {}}
    title='Confirm Action'
    gap='16px'
    >
      <p className={styles.message} title='Confirm Message'>
        { props.message }
      </p>

      <div className={styles.confirm_cancel_buttons_container}>
        <Button
          title='Confirm'
          buttonStyle='DEFAULT'
          label={props.loading ? 'Processing...' : 'Confirm'}
          loading={props.loading}
          onClick={!props.loading ? props.onConfirm : () => {}}
          icon={() => <FaCheckCircle />}
          disabled={props.loading}
          iconSize={14}
          padding={{ Y: '8px' }}
          colors={{
            background: '#00ff0022',
            labelBorder: 'green'
          }}
        />

        <Button
          title='Cancel'
          buttonStyle='DEFAULT'
          label='Cancel'
          onClick={!props.loading ? props.onCancel : () => {}}
          icon={() => <MdCancel />}
          disabled={props.loading}
          padding={{ Y: '8px' }}
          colors={{
            background: '#ff787858',
            labelBorder: '#761B23'
          }}
        />
      </div>
    </ModalBody>
  )
}

export default ConfirmationModal