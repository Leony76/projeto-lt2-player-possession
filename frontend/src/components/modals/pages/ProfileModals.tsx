import type { useProfile } from "@/hooks/pages/useProfile.hook";
import styles from "./css/ProfileModal.module.css";
import { FaEdit } from "react-icons/fa";
import profileImagePlaceholder from "@/assets/img/profile_image_placeholder.png";
import { toLumberBucksFormat } from "@/utils/toLumberBucksFormat.util";
import ImageExpand from "@/components/ImageExpand";
import EditImageModal from "../EditImageModal";
import ConfirmationModal from "../ConfirmationModal";
import ModalBody from "../ModalBody";
import Input from "@/components/Input";
import ErrorMessage from "@/components/ErrorMessage";
import Button from "@/components/Button";
import { IoShieldCheckmark } from "react-icons/io5";

type Props = {
  profile : ReturnType<typeof useProfile>;
};

const ProfileModals = ({ profile }: Props): React.JSX.Element | null => {

  const { user, forms, states, setters, handlers } = profile;

  const {
    onChange: onCurrentPasswordChange,
    ...passwordRegister
  } = forms.passwordForm.register("password");

  const {
    onChange: onNewPasswordChange,
    ...newPasswordRegister
  } = forms.newPasswordForm.register("newPassword");

  if (!user) return null;

  return (
    <>
      {states.modal === "PROFILE_IMAGE_EXPAND" && (
        <ImageExpand
          onClick={() => setters.setModal(null)}
          imageURL={user.profileImageURL ?? profileImagePlaceholder}
          label={user.name}
        />
      )}



      {states.modal === "EDIT_PROFILE_IMAGE" && (
        <EditImageModal
          initialImage={user.profileImageURL || profileImagePlaceholder}
          isSaving={states.isSaving}
          onClose={() => {
            setters.setSelectedImage(null);
            setters.setModal(null);
          }}
          onConfirm={(image) => {
            setters.setSelectedImage(image);
            setters.setModal("CONFIRM_EDIT_PROFILE_IMAGE");
          }}
        />
      )}



      {states.modal === "CONFIRM_EDIT_PROFILE_IMAGE" && (
        <ConfirmationModal
          loading={states.isSaving}
          message="Are you sure you want to change your current profile image?"
          onConfirm={handlers.editProfileImage}
          onCancel={() => setters.setModal("EDIT_PROFILE_IMAGE")}
        />
      )}



      {states.modal === "EDIT_USERNAME" && (
        <ModalBody
          title="Edit username"
          XCloseButton
          gap="8px"
          onClose={() => {
            forms.usernameForm.reset({ username: user.name });
            setters.setFieldError(null);
            setters.setModal(null);
          }}
        >
          <form
          onSubmit={handlers.verifyUsernameAvailabilityToEdit}
          className={styles.fields_form_container}
          >
            <Input
              label="New username"
              placeholder="ex: username_123"
              {...forms.usernameForm.register("username")}
            />

            {(forms.usernameForm.formState.errors.username ||
              states.fieldError) && (
              <ErrorMessage
                error={
                  forms.usernameForm.formState.errors.username?.message ||
                  states.fieldError ||
                  "unknown"
                }
              />
            )}

            <Button
              buttonStyle="FORM"
              label="Edit"
              type="submit"
              disabled={!!forms.usernameForm.formState.errors.username}
              icon={() => <FaEdit />}
            />
          </form>
        </ModalBody>
      )}



      {states.modal === "CONFIRM_EDIT_USERNAME" && (
        <ConfirmationModal
          loading={states.isSaving}
          message={`Are you sure you want to change your username to "${forms.usernameForm.getValues('username')}"?`}
          onConfirm={() => handlers.editUsername(forms.usernameForm.getValues('username'))}
          onCancel={() => {
            setters.setModal("EDIT_USERNAME");
          }}
        />
      )}



      {states.modal === "EDIT_LUMBER_BUCKS" && (
        <ModalBody
          title="Edit lumber bucks"
          XCloseButton
          gap="8px"
          onClose={() => {
            forms.lumberBucksForm.reset({
              lumberBucks: user.lumberBucks,
            });

            setters.setFieldError(null);
            setters.setModal(null);
          }}
        >
          <form
          className={styles.fields_form_container}
          onSubmit={handlers.validateLumberBucks}
          >
            <Input
              label="New lumber bucks amount"
              placeholder="ex: 67000"
              type="number"
              {...forms.lumberBucksForm.register("lumberBucks", {
                valueAsNumber: true,
              })}
            />

            {(forms.lumberBucksForm.formState.errors.lumberBucks ||
              states.fieldError) && (
              <ErrorMessage
                error={
                  forms.lumberBucksForm.formState.errors.lumberBucks?.message ||
                  states.fieldError ||
                  "unknown"
                }
              />
            )}

            <Button
              buttonStyle="FORM"
              label="Edit"
              type="submit"
              disabled={!!forms.lumberBucksForm.formState.errors.lumberBucks}
              icon={() => <FaEdit />}
            />
          </form>
        </ModalBody>
      )}



      {states.modal === "CONFIRM_EDIT_LUMBER_BUCKS" && (
        <ConfirmationModal
          loading={states.isSaving}
          message={`Are you sure you want to set your Lumber Bucks to ${toLumberBucksFormat(forms.lumberBucksForm.getValues('lumberBucks') ?? 0)}?`}
          onConfirm={() => handlers.editLumberBucks(forms.lumberBucksForm.getValues('lumberBucks'))}
          onCancel={() => setters.setModal("EDIT_LUMBER_BUCKS")}
        />
      )}



      {states.modal === "PASSWORD_VERIFICATION" && (
        <ModalBody
          title="Password vefification"
          XCloseButton
          gap="8px"
          onClose={() => {
            forms.passwordForm.reset({ password: '' });
            setters.setFieldError(null);
            setters.setModal(null);
          }}
        >
          <form
          onSubmit={handlers.passwordVerificationBeforeEdit}
          className={styles.fields_form_container}
          >
            <Input
              label="Current password"
              placeholder="Enter your current password"
              {...passwordRegister}
              onChange={(event) => {
                onCurrentPasswordChange(event);
                setters.setFieldError(null);
              }}
            />

            {(forms.passwordForm.formState.errors.password ||
              states.fieldError) && (
              <ErrorMessage
                error={
                  forms.passwordForm.formState.errors.password?.message ||
                  states.fieldError ||
                  "unknown"
                }
              />
            )}

            <Button
              buttonStyle="FORM"
              label="Verify"
              type="submit"
              disabled={!!forms.passwordForm.formState.errors.password}
              icon={() => <IoShieldCheckmark />}
            />
          </form>
        </ModalBody>
      )}



      {states.modal === "EDIT_PASSWORD" && (
        <ModalBody
          title="New password"
          XCloseButton
          gap="8px"
          onClose={() => {
            forms.passwordForm.reset({ password: '' });
            forms.newPasswordForm.reset({ newPassword: '' });
            setters.setFieldError(null);
            setters.setModal(null);
          }}
        >
          <form
          onSubmit={handlers.newPasswordValidate}
          className={styles.fields_form_container}
          >
            <Input
              label="New password"
              placeholder="Enter your new password"
              {...newPasswordRegister}
              onChange={(event) => {
                onNewPasswordChange(event);
                setters.setFieldError(null);
              }}
            />

            {(forms.newPasswordForm.formState.errors.newPassword ||
              states.fieldError) && (
              <ErrorMessage
                error={
                  forms.newPasswordForm.formState.errors.newPassword?.message ||
                  states.fieldError ||
                  "unknown"
                }
              />
            )}

            <Button
              buttonStyle="FORM"
              label="Edit"
              type="submit"
              disabled={!!forms.newPasswordForm.formState.errors.newPassword}
              icon={() => <FaEdit />}
            />
          </form>
        </ModalBody>
      )}



      {states.modal === "CONFIRM_EDIT_PASSWORD" && (
        <ConfirmationModal
          loading={states.isSaving}
          message={`Are you sure you want to update your current password?`}
          onConfirm={() => handlers.editPassword(forms.newPasswordForm.getValues('newPassword'))}
          onCancel={() => setters.setModal("EDIT_PASSWORD")}
        />
      )}
    </>
  );
};

export default ProfileModals;
