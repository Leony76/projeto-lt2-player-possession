import React from 'react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import styles from './css/PaginationNavButtons.module.css';

type Props = {
  hasPreviousPage : boolean;
  hasNextPage     : boolean;
  loading         : boolean;
  page            : number;
  totalPages      : number;
  setPage         : (newPage: number) => void;
};

const PaginationNavButtons = (props:Props): React.JSX.Element => {
  return (
    <div className={styles.pagination}>
      <button
      type="button"
      disabled={!props.hasPreviousPage || props.loading}
      onClick={() => props.setPage(props.page - 1)}
      >
        <div>
          <FaArrowLeft />
        </div>

        <span>
          Previous
        </span>
      </button>

      <div className={styles.pagination_numbers}>
        Page 
          <span>
            {props.page}
          </span> 
        of 
          <span>
            {props.totalPages}
          </span>
      </div>

      <button
      type="button"
      disabled={!props.hasNextPage || props.loading}
      onClick={() => props.setPage(props.page + 1)}
      >
        <span>
          Next
        </span>

        <div>
          <FaArrowRight />           
        </div>
      </button>
    </div>
  )
}

export default PaginationNavButtons;