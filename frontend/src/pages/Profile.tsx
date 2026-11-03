import styles from './css/Profile.module.css';
import Layout from './Layout';
import PageTitle from '@/components/PageTitle';
import { FaEdit, FaUser } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
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
import ModalBody from '@/components/ModalBody';
import Input from '@/components/Input';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usernameSchema, lumberBucksSchema, type UsernameFormData, type LumberBucksFormData } from "@/schemas/editProfileInfos.schema";
import ErrorMessage from '@/components/ErrorMessage';

type SelectedImage = {
  file?     : File;
  imageURL? : string;
};

type Modals = 
| 'EDIT_PROFILE_IMAGE' 
| 'CONFIRM_EDIT_PROFILE_IMAGE'

| 'EDIT_USERNAME' 
| 'CONFIRM_EDIT_USERNAME' 

| 'EDIT_LUMBER_BUCKS' 
| 'CONFIRM_EDIT_LUMBER_BUCKS' 

| 'PROFILE_IMAGE_EXPAND'
;


const Profile = (): React.JSX.Element => {

  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const usernameForm = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username : user?.name,
    },
  });

  const lumberBucksForm = useForm<LumberBucksFormData>({
    
    resolver: zodResolver(lumberBucksSchema),
    defaultValues: {
      lumberBucks:  user?.lumberBucks,
    },
  });

  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [isSavingImage, setIsSavingImage] = useState<boolean>(false);

  const [pendingUsername, setPendingUsername] = useState<string | null>(null);
  const [usernameEditError, setUsernameEditError] = useState<string | null>(null);
  const [pendingLumberBucks, setPendingLumberBucks] = useState<number | null>(null);
  
  const [isSavingUsername, setIsSavingUsername] = useState<boolean>(false);
  const [lumberBucksEditError, setLumberBucksEditError] = useState<string | null>(null);
  const [isSavingLumberBucks, setIsSavingLumberBucks] = useState<boolean>(false);

  const [modal, setModal] = useState<Modals | null>(null);

  const handle = {

    editProfileImage: async(): Promise<void> => {
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
    },

    prepareUsernameEdit: usernameForm.handleSubmit(async (data) => {
      try {
        setPendingUsername(data.username);
        
        const result = await UserService.verifyUsernameAvailability({ 
          username: data.username, 
        });
        
        if (result.success) {
          setUsernameEditError(null);
          setModal("CONFIRM_EDIT_USERNAME");
        };
      } catch (error: unknown) {
        setUsernameEditError(handleAxiosError(error));
      }
    }),

    editUsername: async(): Promise<void> => {
      try {
        if (isSavingImage) return;
        setIsSavingUsername(true);
        
        if (!pendingUsername) throw new Error("New username was not provided");

        const result = await UserService.editUsername({ username: pendingUsername });
        
        updateUser({
          name: result.body.username,
        });

        if (result.success) showToast('SUCCESS', result.message);

      } catch (error:unknown) {
        showToast('ERROR', handleAxiosError(error));
      } finally {
        setModal(null);
        setIsSavingUsername(false);
      }
    },
    
    prepareLumberBucksEdit: lumberBucksForm.handleSubmit((data) => {
      setPendingLumberBucks(data.lumberBucks);
      setModal("CONFIRM_EDIT_LUMBER_BUCKS");
    }),
    
    editLumberBucks: async(): Promise<void> => {
      try {
        if (isSavingLumberBucks) return;
        setIsSavingLumberBucks(true);

        const result = await UserService.editLumberBucks(pendingLumberBucks);

      } catch (error:unknown) {
        showToast('ERROR', handleAxiosError(error));
      } finally {
        setIsSavingLumberBucks(false);
        setModal(null);
      }
    },
  }



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
      { modal === 'PROFILE_IMAGE_EXPAND' && 
        <ImageExpand 
          onClick={() => setModal(null)}
          imageURL={user?.profileImageURL ?? profileImagePlaceholder} 
          label={user?.name ?? 'unknown'}
        />
      }



      {modal === "EDIT_PROFILE_IMAGE" && (
        <EditImageModal
          initialImage={user?.profileImageURL || profileImagePlaceholder}
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
          onConfirm={handle.editProfileImage}
          onCancel={() => {
            setModal("EDIT_PROFILE_IMAGE");
          }}
        />
      )}


      { modal === 'EDIT_USERNAME' && (
        <ModalBody
        title='Edit username'
        XCloseButton
        gap='8px'
        onClose={() => {
          usernameForm.reset({ username: user?.name });
          setUsernameEditError(null);
          setModal(null);
        }}
        >
          <form 
          onSubmit={handle.prepareUsernameEdit}
          className={styles.fields_form_container}
          >
            <Input
              label='New username'
              placeholder='ex: username_123'
              {...usernameForm.register("username")}
            />

            {(usernameForm.formState.errors.username || usernameEditError) && (
              <ErrorMessage error={(usernameForm.formState.errors.username?.message || usernameEditError) ?? 'unknown'}/>
            )}

            <Button
              buttonStyle='FORM'
              label='Edit'
              type='submit'
              disabled={!!usernameForm.formState.errors.username}
              icon={() => <FaEdit />}
            />
          </form>
        </ModalBody>
      )}

      {modal === "CONFIRM_EDIT_USERNAME" && (
        <ConfirmationModal
          loading={isSavingUsername}
          message={`Are you sure you want to change your username to "${pendingUsername}"?`}
          onConfirm={handle.editUsername}
          onCancel={() => {
            setPendingUsername(null);
            setModal("EDIT_USERNAME");
          }}
        />
      )}


      {modal === "EDIT_LUMBER_BUCKS" && (
        <ModalBody
          title="Edit lumber bucks"
          XCloseButton
          gap="8px"
          onClose={() => {
            lumberBucksForm.reset({ lumberBucks: user?.lumberBucks });
            setLumberBucksEditError(null);
            setModal(null);
          }}
        >
          <form 
          className={styles.fields_form_container}
          onSubmit={handle.prepareLumberBucksEdit}
          >
            <Input
              label="New lumber bucks amount"
              placeholder="ex: 67000"
              type="number"
              {...lumberBucksForm.register("lumberBucks", {
                valueAsNumber: true,
              })}
            />

            {(lumberBucksForm.formState.errors.lumberBucks || lumberBucksEditError) && (
              <ErrorMessage error={(lumberBucksForm.formState.errors.lumberBucks?.message || lumberBucksEditError) ?? 'unknown'}/>
            )}

            <Button
              buttonStyle="FORM"
              label="Edit"
              type="submit"
              disabled={!!lumberBucksForm.formState.errors.lumberBucks}
              icon={() => <FaEdit />}
            />
          </form>
        </ModalBody>
      )}

      {modal === "CONFIRM_EDIT_LUMBER_BUCKS" && (
        <ConfirmationModal
          loading={isSavingLumberBucks}
          message={`Are you sure you want to set your Lumber Bucks to ${toLumberBucksFormat(pendingLumberBucks ?? 0)}?`}
          onConfirm={handle.editLumberBucks}
          onCancel={() => {
            setPendingLumberBucks(null);
            setModal("EDIT_LUMBER_BUCKS");
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
                src={user?.profileImageURL ?? profileImagePlaceholder} 
                alt={user?.name} 
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
                        onClick={() => setModal(modalField[item.label])}
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