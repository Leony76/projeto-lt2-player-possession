
import { useEffect, useRef, useState } from "react";
import { MdHideImage } from "react-icons/md";
import { RiImageEditFill, RiImageUploadFill } from "react-icons/ri";
import profileImagePlaceholder from '@/assets/img/profile_image_placeholder.png';
import ModalBody from "./ModalBody";
import Input from "../Input";
import Button from "../Button";
import ErrorMessage from "../ErrorMessage";
import styles from "../css/EditImageModal.module.css";
import ImageExpand from "../ImageExpand";

type Props = {
  initialImage? : string;
  onClose       : () => void;
  onConfirm     : (image: { file?: File; imageURL?: string }) => void;
  isSaving?     : boolean;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const EditImageModal = ({
  initialImage = "",
  onClose,
  onConfirm,
  isSaving = false,
}: Props): React.JSX.Element => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageURL, setImageURL] = useState<string>(initialImage);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialImage);
  const [imageError, setImageError] = useState<string>("");
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [imageExpand, setImageExpand] = useState<boolean>(false);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(imageURL);
      return;
    }

    const objectURL = URL.createObjectURL(imageFile);
    setImagePreview(objectURL);

    return () => URL.revokeObjectURL(objectURL);
  }, [imageFile, imageURL]);



  const handleURLChange = (value: string): void => {
    setImageURL(value);
    setImageFile(null);
    setImageError("");
    setImageLoadError(false);
  };



  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError("The image must be no larger than 5 MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImageURL("");
    setImageError("");
    setImageLoadError(false);
  };



  const handleConfirm = (): void => {
    if (imageFile) {
      onConfirm({ file: imageFile });
      return;
    }

    const url = imageURL.trim();

    if (!url) {
      setImageError("Please provide an image.");
      return;
    }

    try {
      const parsedURL = new URL(url);

      if (!["http:", "https:"].includes(parsedURL.protocol)) {
        setImageError("Please provide a valid HTTP or HTTPS URL.");
        return;
      }
    } catch {
      setImageError("Please provide a valid image URL.");
      return;
    }

    onConfirm({ imageURL: url });
  };

  const hasImage = Boolean(imageFile || imageURL.trim());

  return (
    <>
    { imageExpand && 
      <ImageExpand 
        onClick={() => setImageExpand(false)}
        imageURL={imagePreview || profileImagePlaceholder} 
        label={'Image Preview'}
      />
    }

    <ModalBody
      XCloseButton
      onClose={onClose}
      title="Edit Image"
      gap="8px"
    >
      <figure
      title="Zoom in"
      onClick={() => setImageExpand(true)}
      className={styles.edit_image_preview_container}
      style={{
        cursor: imageLoadError ? "not-allowed" : "zoom-in",
      }}
      >
        {imagePreview && !imageLoadError ? (
          <img
            className={styles.edit_image_preview}
            src={imagePreview}
            alt="Image preview"
            onError={() => {
              setImageLoadError(true);
              setImageError("Unable to load this image.");
            }}
          />
        ) : (
          <div className={styles.image_error_placeholder}>
            <MdHideImage size={32} />
            <span>Unable to render image</span>
          </div>
        )}
      </figure>

      <Input
        title="Image URL"
        label="Image URL"
        type="url"
        value={imageURL}
        placeholder="https://example.com/image.png"
        onChange={(event) => handleURLChange(event.target.value)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageUpload}
      />

      <span title="--or--" className={styles.__or__edit_form}>or</span>

      <Button
        title="Upload local image"
        label="Upload"
        buttonStyle="DEFAULT"
        icon={() => <RiImageUploadFill />}
        onClick={() => fileInputRef.current?.click()}
      />

      {imageError && <ErrorMessage error={imageError} />}

      <Button
        title="Procced"
        label={isSaving ? "Processing..." : "Edit"}
        buttonStyle="FORM"
        disabled={isSaving || !hasImage || !!imageError}
        onClick={handleConfirm}
        icon={() => <RiImageEditFill />}
      />
    </ModalBody>
    </>
  );
};

export default EditImageModal;
