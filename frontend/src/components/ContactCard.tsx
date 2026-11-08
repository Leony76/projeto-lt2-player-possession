import React from 'react'
import styles from './css/ContactCard.module.css';
import { Link } from 'react-router-dom';
import Button from './Button';
import { FaCheck, FaClock, FaPlus } from 'react-icons/fa';
import { toMonthDayYearTwelveHoursFormat } from '@/utils/toMonthDayYearTwelveHoursFormat.util';
import type { ContactRelationStatus } from '@shared/types/contactRelationStatus.type';
import { IoClose } from 'react-icons/io5';
import { useAuth } from '@/contexts/AuthContext';

type UserBaseInfos = {
  profileImageURL : string;
  username        : string;
  userId          : number;
};

type Props = UserBaseInfos & {
  display : 'SIMPLE';
} | UserBaseInfos & {
  display : 'DETAILED';

  isAcceptingContactRequest : boolean;
  isDeningContactRequest    : boolean;
  isAddingContact           : boolean;

  totalItems     : number;
  relationStatus : ContactRelationStatus;
  joinedAt       : string;
  
  onAddContact           : (contactId: number) => void;
  onAcceptContactRequest : (contactId: number) => void;
  onDenyContactRequest   : (contactId: number) => void;
};

const ContactCard = (props: Props): React.JSX.Element => {

  const { user } = useAuth();

  const profileImage: React.JSX.Element = (
    <figure className={styles.profile_image_container}>
      <img
        className={styles.profile_image}
        src={props.profileImageURL}
        alt={props.username}
      />
    </figure>
  );

  if (props.display === 'SIMPLE') {
    return (
      <Link
      className={styles.simple_container}
      title={props.username}
      to={user?.id === props.userId
        ? `/profile`
        : `/contact/${props.userId}`
      }
      >
        { profileImage }

        <span className={styles.username}>
          {props.username ?? '[ Unknown ]'}
        </span>
      </Link>
    );
  }

  return (
    <div className={styles.detailed_container}>
      { profileImage }

      <div className={styles.descriptive_infos_container}>
        <ul>
          <li>
            <h4>
              <Link
              to={`/contact/${props.userId}`}
              className={styles.link}
              title={props.username}
              >
                { props.username }
              </Link>
            </h4>
          </li>

          <div className={styles.joined_at_total_items_container}>
            <li>
              <span title='Joined at'>
                Joined at <b>{toMonthDayYearTwelveHoursFormat(props.joinedAt)}</b>
              </span>
            </li>

            <li title='Items'>
              <span><b>{props.totalItems}</b> items</span>
            </li>
          </div>

          <li className={styles.contact_actions_container}>
            {props.relationStatus === 'CONTACT' ? (
              <div className={styles.contacts_label_being_contacts}>
                <FaCheck />
                <span>Contacts</span>
              </div>
            ) : props.relationStatus === 'REQUEST_SENT' ? (
              <div className={styles.contacts_label_pending}>
                <FaClock size={16} />
                <span>Pending</span>
              </div>
            ) : props.relationStatus === 'REQUEST_RECEIVED' ? (
              <div className={styles.request_received}>
                <span>
                  Contact request received
                </span>

                <div>
                  <Button
                    buttonStyle="DEFAULT"
                    label={props.isAcceptingContactRequest ? '' : "Accept"}
                    loading={props.isAcceptingContactRequest}
                    disabled={props.isDeningContactRequest}
                    onClick={() => props.onAcceptContactRequest(props.userId)}
                    icon={() => <FaCheck size={10}/>}
                    padding={{
                      X: '14px'
                    }}
                    brightness={{
                      active: 0.4,
                      hover: 0.7,
                    }}
                    colors={{
                      background: '#6fdd3832',
                      labelBorder: '#548e37fd',
                    }}
                  />

                  <Button
                    buttonStyle="DEFAULT"
                    label={props.isDeningContactRequest ? '' : "Deny"}
                    loading={props.isDeningContactRequest}
                    disabled={props.isAcceptingContactRequest}
                    onClick={() => props.onDenyContactRequest(props.userId)}
                    icon={() => <IoClose />}
                    brightness={{
                      active: 0.4,
                      hover: 0.7,
                    }}
                    colors={{
                      background: '#dd384632',
                      labelBorder: '#dd3845'
                    }}
                  />
                </div>
              </div>
            ) : (
              <Button
                buttonStyle="DEFAULT"
                label={props.isAddingContact ? '' : "Add Contact"}
                loading={props.isAddingContact}
                onClick={() => props.onAddContact(props.userId)}
                icon={() => <FaPlus size={14}/>}
                brightness={{
                  active: 0.4,
                  hover: 0.7,
                }}
                iconPosition={{
                  bottom: '-2px'
                }}
                colors={{
                  background: '#6fdd3832',
                  labelBorder: '#548e37fd',
                }}
              />
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ContactCard