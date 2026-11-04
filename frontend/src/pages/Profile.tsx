import styles from './css/Profile.module.css';
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import { FaUser } from 'react-icons/fa';
import profileImagePlaceholder from '@/assets/img/profile_image_placeholder.png';
import Button from '@/components/Button';
import { RiImageEditFill } from 'react-icons/ri';
import { MdEditSquare, MdOutlinePublic, MdPublicOff } from 'react-icons/md';
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat.util';
import SectionTitle from '@/components/SectionTitle';
import { useProfile, type Modals } from '@/hooks/pages/useProfile.hook';
import { Navigate } from 'react-router-dom';
import ProfileModals from '@/components/modals/pages/ProfileModals';

const Profile = (): React.JSX.Element => {

  const profile = useProfile();

  const { user, setters } = profile;

  if (!user) return <Navigate to='/'/>;

  const userPublicInfos: { label: string, value: string | number }[] = [
    { label: 'Identifier (Id):' , value: user?.id ?? 0 },
    { label: 'Username:'        , value: user?.name ?? 'unknown' },
    { label: 'Lumber bucks:'    , value: toLumberBucksFormat(user?.lumberBucks ?? 0) },
  ];

  const userPrivateInfos: { label: string, value: string | number }[] = [
    { label: 'Password:' , value: '********' },
  ];
  
  return (
    <Layout >
      <>
      <ProfileModals profile={profile} />

      <div className={styles.container}>
        <PageTitle
          Icon={() => <FaUser />}
          title='Profile'
        />

        <div className={styles.main_container}>
          <div className={styles.profile_image_container}>
            <button 
            onClick={() => setters.setModal('PROFILE_IMAGE_EXPAND')}
            className={styles.profile_image_inner_container}
            >
              <img 
                className={styles.profile_image}
                src={user?.profileImageURL ?? profileImagePlaceholder} 
                alt={user?.name} 
              />
            </button>
           

            <div className={styles.edit_profile_image_button}>
              <Button
                buttonStyle='DEFAULT'
                label='Edit'
                onClick={() => setters.setModal('EDIT_PROFILE_IMAGE')}
                icon={() => <RiImageEditFill/>}
              />
            </div>
          </div>

          <div className={styles.sections_container}>
            <section className={styles.section_container}>
              <SectionTitle
                icon={() => <MdOutlinePublic />}
                title='Public infos'
              />

              <dl className={styles.dl}>
                { userPublicInfos.map((item, index) => {

                  const isId = item.label === 'Identifier (Id):';

                  const modalField: Record<string, Modals> = {
                    'Username:'     : 'EDIT_USERNAME'     ,
                    'Lumber bucks:' : 'EDIT_LUMBER_BUCKS' ,                 
                  };

                  return (
                    <div 
                    className={styles.dt_dd_container} 
                    style={{ marginLeft: isId ? '24px' : '0px' }}
                    key={index}
                    >
                      { !isId &&
                        <button 
                        className={styles.edit_button}
                        onClick={() => setters.setModal(modalField[item.label])}
                        >
                          <MdEditSquare />
                        </button>
                      }

                      <dt className={styles.dt} title={item.label}>
                        { item.label } 
                      </dt>

                      <dd className={styles.dd} title={item.value.toString()}> 
                        { item.value } 
                      </dd>
                    </div> 
                  )
                })}
              </dl>
            </section>

            <section className={styles.section_container}>
              <SectionTitle
                icon={() => <MdPublicOff />}
                title='Private infos'
              />
              
              <dl className={styles.dl}>
                { userPrivateInfos.map((item, index) => {

                  const modalField: Record<string, Modals> = {
                    'Password:' : 'PASSWORD_VERIFICATION',                 
                  };

                  return (
                    <div 
                    className={styles.dt_dd_container} 
                    key={index}
                    >
                      <button 
                      className={styles.edit_button}
                      onClick={() => setters.setModal(modalField[item.label])}
                      >
                        <MdEditSquare />
                      </button>
                      
                      <dt className={styles.dt} title={item.label}>
                        { item.label } 
                      </dt>

                      <dd className={styles.dd} title={item.value.toString()}> 
                        { item.value }
                      </dd>
                    </div>        
                  )
                })}
              </dl>
            </section>
          </div>
        </div>
      </div>
      </>
    </Layout>
  )
}

export default Profile