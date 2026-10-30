import React from 'react'
import styles from './css/ContactCard.module.css';
import { Link } from 'react-router-dom';

type Props = {
  profileImageURL : string;
  username        : string;
};

const ContactCard = (props:Props): React.JSX.Element => {
  return (
    <Link 
    className={styles.container}
    title={props.username}
    to={`/profile/${props.username}`}
    >
      <figure className={styles.profile_image_container}>
        <img 
          className={styles.profile_image}
          src={props.profileImageURL} 
          alt={props.username} 
        />
      </figure>

      <span className={styles.username}>
        { props.username ?? '[ Unknown ]' }
      </span>
    </Link>
  )
}

export default ContactCard