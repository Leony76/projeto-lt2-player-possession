import React from 'react'
import styles from './css/PageTitle.module.css';

type Props = {
  title : string;
  Icon  : React.ElementType;
};

const PageTitle = (props:Props): React.JSX.Element => {

  const Icon = props.Icon;

  return (
    <h1 className={styles.h1}>
      <span className={styles.icon}>
        <Icon/>
      </span>

      <span className={styles.span}>
        { props.title }
      </span>
    </h1>
  )
}

export default PageTitle