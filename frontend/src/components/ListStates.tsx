import styles from './css/ListStates.module.css';
import LoadingSpinner from './LoadingSpinner'
import { MdError } from 'react-icons/md'
import { FaQuestionCircle } from 'react-icons/fa'

export const LoadingState = ({label} : {label: string}): React.JSX.Element => {
  return (
    <div className={styles.loading_items}>
      <div>
        <LoadingSpinner size={20}/>
      </div>

      <span>
        Loading { label }...
      </span>
    </div>
  )
}



export const ErrorState = ({error} : {error: string}): React.JSX.Element => {
  return (
    <p className={styles.load_items_error}> 
      <MdError size={20}/>
    
      <span>
        { error }  
      </span>
    </p>
  )
}



export const NotFoundState = ({label} : {label: string}): React.JSX.Element => {
  return (
    <p className={styles.no_items_found}>
      <FaQuestionCircle size={20}/> 

      <span>
        No { label } found.
      </span> 
    </p>
  )
}

