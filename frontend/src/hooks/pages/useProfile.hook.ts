import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { UserService } from "@/services/user.service";
import { usernameSchema, lumberBucksSchema, type UsernameFormData, type LumberBucksFormData, type PasswordFormData, passwordSchema, type NewPasswordFormData, newPasswordSchema } from "@shared/schemas/editProfileInfos.schema";
import { handleAxiosError } from "@/utils/handleAxiosError.util";

type SelectedImage = {
  file?     : File;
  imageURL? : string;
};

export type Modals = 
| 'EDIT_PROFILE_IMAGE' 
| 'CONFIRM_EDIT_PROFILE_IMAGE'

| 'EDIT_USERNAME' 
| 'CONFIRM_EDIT_USERNAME' 

| 'EDIT_LUMBER_BUCKS' 
| 'CONFIRM_EDIT_LUMBER_BUCKS' 

| 'PASSWORD_VERIFICATION' 
| 'EDIT_PASSWORD' 
| 'CONFIRM_EDIT_PASSWORD' 

| 'PROFILE_IMAGE_EXPAND'
;

export const useProfile = () => {

  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const usernameForm = useForm<UsernameFormData>({
    resolver      : zodResolver(usernameSchema) ,
    defaultValues : { username : user?.name }   ,
  });

  const lumberBucksForm = useForm<LumberBucksFormData>({
    resolver      : zodResolver(lumberBucksSchema)      ,
    defaultValues : { lumberBucks:  user?.lumberBucks } ,
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver      : zodResolver(passwordSchema)      ,
    defaultValues : { password:  '' } ,
  });

  const newPasswordForm = useForm<NewPasswordFormData>({
    resolver      : zodResolver(newPasswordSchema)      ,
    defaultValues : { newPassword:  '' } ,
  });

  // States
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [modal, setModal] = useState<Modals | null>(null);

  // Handlers
  const editProfileImage = async (): Promise<void> => { 
    try {
      if (!selectedImage || isSaving) return;
  
      setIsSaving(true);

      const response = selectedImage.file
        ? await UserService.editProfileImage({ file: selectedImage.file })
        : await UserService.editProfileImage({ imageURL: selectedImage.imageURL! });

      if (response.success) {
        updateUser({
          profileImageURL: response.body.profileImageURL,
        });

        showToast("SUCCESS", response.message);
        setSelectedImage(null);
      }
    } catch (error: unknown) {
      showToast("ERROR", handleAxiosError(error));
    } finally {
      setIsSaving(false);
      setModal(null);
    }
  };



  const verifyUsernameAvailabilityToEdit = usernameForm.handleSubmit(async (data) => {
    try {
      const result = await UserService.verifyUsernameAvailability({
        username: data.username,
      });

      if (result.success) {
        setFieldError(null);
        setModal("CONFIRM_EDIT_USERNAME");
      }
    } catch (error: unknown) {
      setFieldError(handleAxiosError(error));
    }
  });



  const editUsername = async(username: string): Promise<void> => {  
    try {
      if (isSaving) return;
  
      setIsSaving(true);

      if (usernameForm.getValues('username') === null) {
        throw new Error("New username was not provided");
      }

      const result = await UserService.editUsername({
        username,
      });

      if (result.success) {
        updateUser({ name: result.body.username });
        showToast("SUCCESS", result.message);
      }
    } catch (error: unknown) {
      showToast("ERROR", handleAxiosError(error));
    } finally {
      setIsSaving(false);
      setModal(null);
    }
  };



  const validateLumberBucks = lumberBucksForm.handleSubmit(() => {
    setModal("CONFIRM_EDIT_LUMBER_BUCKS");
  });



  const editLumberBucks = async (lumberBucks: number): Promise<void> => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      if (lumberBucks === null) {
        throw new Error("New lumber bucks amount was not provided");
      }

      const result = await UserService.editLumberBucks({
        lumberBucks,
      });

      if (result.success) {
        updateUser({ lumberBucks: result.body.lumberBucks });
        showToast("SUCCESS", result.message);
      }
    } catch (error: unknown) {
      showToast("ERROR", handleAxiosError(error));
    } finally {
      setIsSaving(false);
      setModal(null);
    }
  };



  const passwordVerificationBeforeEdit = passwordForm.handleSubmit( async(data) => {
    try {
      if (isSaving) return;
      setIsSaving(true);
      
      const response = await UserService.passwordVerificationBeforeEdit({ password: data.password }); 

      if (response.body.success) {
        setModal('EDIT_PASSWORD');
        setFieldError(null);
        return;
      } 

      setFieldError('Incorrect password');
    } catch (error:unknown) {
      setFieldError(handleAxiosError(error));
    } finally {
      setIsSaving(false);
    }
  });



  const newPasswordValidate = newPasswordForm.handleSubmit( async(data) => {
    if (data.newPassword === passwordForm.getValues('password')) {
      setFieldError('The new password cannot be the same as the current one');
      return;
    }
    
    setModal('CONFIRM_EDIT_PASSWORD');
  });



  const editPassword = async(newPassword: string): Promise<void> => {
    try {
      if (isSaving) return;
      setIsSaving(true);
      
      const response = await UserService.editPassword({ newPassword }); 

      if (response.body.success) {
        setFieldError(null);

        passwordForm.reset({ password: "" });
        newPasswordForm.reset({ newPassword: "" });

        setModal(null);

        showToast("SUCCESS", response.message);
      } 
    } catch (error:unknown) {
      setFieldError(handleAxiosError(error));
    } finally {
      setIsSaving(false);
    }
  };



  return {
    user,
    forms : {
      passwordForm,
      usernameForm,
      lumberBucksForm,
      newPasswordForm,
    },

    states: {
      selectedImage,
      fieldError,
      isSaving,
      modal,
    },

    setters: {
      setSelectedImage,
      setFieldError,
      setModal,
    },

    handlers: {
      newPasswordValidate,
      passwordVerificationBeforeEdit,
      validateLumberBucks,
      editProfileImage,
      verifyUsernameAvailabilityToEdit,
      editPassword,
      editUsername,
      editLumberBucks,
    },
  };
}
