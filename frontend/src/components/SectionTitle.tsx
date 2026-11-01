import React from 'react'
import styles from './css/SectionTitle.module.css';

type Props = {
  icon  : React.ElementType;
  title : string;
};

const SectionTitle = (props:Props): React.JSX.Element => {

  const Icon = props.icon;
  
  return (
    <h2 
    className={styles.section_title} 
    title={props.title}
    >
      <div className={styles.icon}>
        <Icon/> 
      </div>
      
      <span className={styles.label}>
        { props.title }
      </span>
    </h2>
  )
}

export default SectionTitle