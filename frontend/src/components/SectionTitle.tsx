import React from 'react'
import styles from './css/SectionTitle.module.css';

type Props = {
  icon  : React.ElementType;
  title : string;
  size? : `${number}px`;
};

const SectionTitle = (props:Props): React.JSX.Element => {

  const Icon = props.icon;
  
  return (
    <h2 
    className={styles.section_title} 
    title={props.title}
    style={{ 
      ...(props.size && { fontSize: props.size })  
    }}
    >
      <div 
      className={styles.icon}
      style={{ 
        ...(props.size && { fontSize: props.size })  
      }}
      >
        <Icon/> 
      </div>
      
      <span className={styles.label}>
        { props.title }
      </span>
    </h2>
  )
}

export default SectionTitle