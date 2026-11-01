import React, { useState } from 'react'
import styles from './css/Profile.module.css';
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import profileImagePlaceholder from '@/assets/img/profile_image_placeholder.png';
import Button from '@/components/Button';
import { RiImageEditFill } from 'react-icons/ri';
import { MdEditSquare, MdOutlinePublic, MdPublicOff } from 'react-icons/md';
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat.util';
import SectionTitle from '@/components/SectionTitle';
import ImageExpand from '@/components/ImageExpand';
import ModalBody from '@/components/ModalBody';
import Input from '@/components/Input';

type Modals = 
| 'EDIT_PROFILE_IMAGE' 
| 'CONFIRM_EDIT_PROFILE_IMAGE'
;

const Profile = (): React.JSX.Element => {

  const { user } = useAuth();

  if (!user) return <Navigate to={'/'}/>

  const [expandImage, setExpandImage] = useState<boolean>(false);
  const [modal, setModal] = useState<Modals | null>(null);



  const updateProfileImage = async() => {

  }



  const userPublicInfos: { label: string, value: string | number }[] = [
    { label: 'Identifier (Id):' , value: user.id },
    { label: 'Username:'        , value: user.name },
    { label: 'Lumber bucks:'    , value: toLumberBucksFormat(user.lumberBucks) },
  ];

  const userPrivateInfos: { label: string, value: string | number }[] = [
    { label: 'Password:' , value: '********' },
  ];
  
  return (
    <Layout >
      <>
      { expandImage && 
        <ImageExpand 
          onClick={() => setExpandImage(false)}
          imageURL={user.profileImageURL ?? profileImagePlaceholder} 
          label={user.name}
        />
      }

      { modal === 'EDIT_PROFILE_IMAGE' &&
        <ModalBody
        XCloseButton
        onClose={() => setModal(null)}
        title='Edit Image'
        gap='8px'
        >
          <div>
            <figure className={styles.new_profile_image_preview_container}>
              <img 
                className={styles.new_profile_image_preview}
                src="" 
                alt="" 
              />
            </figure>

            <Input
              label='Image URL'
            />

            or

            <Button
              label='Upload'
              buttonStyle='DEFAULT'
              onClick={() => {}}
            />

            <Button
              label='Edit'
              buttonStyle='DEFAULT'
              onClick={() => {}}
            />         
          </div>
        </ModalBody>
      }

      <div className={styles.container}>
        <PageTitle
          Icon={() => <FaUser />}
          title='Profile'
        />

        <div className={styles.main_container}>
          <div className={styles.profile_image_container}>
            <button 
            onClick={() => setExpandImage(true)}
            className={styles.profile_image_inner_container}
            >
              <img 
                className={styles.profile_image}
                src={user.profileImageURL ?? profileImagePlaceholder} 
                alt={user.name} 
              />
            </button>
           

            <div className={styles.edit_profile_image_button}>
              <Button
                buttonStyle='DEFAULT'
                label='Edit'
                onClick={() => setModal('EDIT_PROFILE_IMAGE')}
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
                { userPublicInfos.map((item, index) => (
                  <div 
                  className={styles.dt_dd_container} 
                  key={index}
                  >
                    <button className={styles.edit_button}>
                      <MdEditSquare />
                    </button>

                    <dt className={styles.dt} title={item.label}>
                      { item.label } 
                    </dt>

                    <dd className={styles.dd} title={item.value.toString()}> 
                      { item.value } 
                    </dd>
                  </div> 
                ))}
              </dl>
            </section>

            <section className={styles.section_container}>
              <SectionTitle
                icon={() => <MdPublicOff />}
                title='Private infos'
              />
              
              <dl className={styles.dl}>
                { userPrivateInfos.map((item, index) => (
                  <div 
                  className={styles.dt_dd_container} 
                  key={index}
                  >
                    <button className={styles.edit_button}>
                      <MdEditSquare />
                    </button>
                    
                    <dt className={styles.dt} title={item.label}>
                      { item.label } 
                    </dt>

                    <dd className={styles.dd} title={item.value.toString()}> 
                      { item.value }
                    </dd>
                  </div>        
                )) }
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