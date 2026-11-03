import styles from './css/Profile.module.css';
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import profileImagePlaceholder from '@/assets/img/profile_image_placeholder.png';
import Button from '@/components/Button';
import { RiImageEditFill } from 'react-icons/ri';
import { useState } from "react";
import { MdEditSquare, MdOutlinePublic, MdPublicOff } from 'react-icons/md';
import { toLumberBucksFormat } from '@/utils/toLumberBucksFormat.util';
import SectionTitle from '@/components/SectionTitle';
import ImageExpand from '@/components/ImageExpand';
import ConfirmationModal from '@/components/ConfirmationModal';
import { UserService } from '@/services/user.service';
import { handleAxiosError } from '@/utils/handleAxiosError.util';
import EditImageModal from '@/components/EditImageModal';
import { useToast } from '@/contexts/ToastContext';

type SelectedImage = {
  file?     : File;
  imageURL? : string;
};

type Modals = 
| 'EDIT_PROFILE_IMAGE' 
| 'CONFIRM_EDIT_PROFILE_IMAGE'
| 'PROFILE_IMAGE_EXPAND'
;

const Profile = (): React.JSX.Element => {

  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  if (!user) return <Navigate to={'/'}/>

  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [isSavingImage, setIsSavingImage] = useState<boolean>(false);
  const [modal, setModal] = useState<Modals | null>(null);


  const handleEditProfileImage = async () => {
    if (!selectedImage) return;

    setIsSavingImage(true);

    try {
      const response = selectedImage.file
        ? await UserService.editProfileImage({ file     : selectedImage.file      })
        : await UserService.editProfileImage({ imageURL : selectedImage.imageURL! })
      ;

      updateUser({
        profileImageURL: response.body.profileImageURL,
      });

      showToast("SUCCESS", response.message);

      setSelectedImage(null);
      setModal(null);
    } catch (error: unknown) {
      showToast("ERROR", handleAxiosError(error));
    } finally {
      setIsSavingImage(false);
    }
  };



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
      { modal === 'PROFILE_IMAGE_EXPAND' && 
        <ImageExpand 
          onClick={() => setModal(null)}
          imageURL={user.profileImageURL ?? profileImagePlaceholder} 
          label={user.name}
        />
      }



      {modal === "EDIT_PROFILE_IMAGE" && (
        <EditImageModal
          initialImage={user.profileImageURL || profileImagePlaceholder}
          isSaving={isSavingImage}
          onClose={() => {
            setSelectedImage(null);
            setModal(null);
          }}
          onConfirm={(image) => {
            setSelectedImage(image);
            setModal("CONFIRM_EDIT_PROFILE_IMAGE");
          }}
        />
      )}



      {modal === "CONFIRM_EDIT_PROFILE_IMAGE" && (
        <ConfirmationModal
          loading={isSavingImage}
          message="Are you sure you want to change your current profile image?"
          onConfirm={handleEditProfileImage}
          onCancel={() => {
            setModal("EDIT_PROFILE_IMAGE");
          }}
        />
      )}

      <div className={styles.container}>
        <PageTitle
          Icon={() => <FaUser />}
          title='Profile'
        />

        <div className={styles.main_container}>
          <div className={styles.profile_image_container}>
            <button 
            onClick={() => setModal('PROFILE_IMAGE_EXPAND')}
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