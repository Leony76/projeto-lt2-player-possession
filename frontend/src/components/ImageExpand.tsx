
import React from 'react';
import { createPortal } from 'react-dom';
import styles from './css/ImageExpand.module.css';

type Props = {
  imageURL: string;
  label: string;
  onClick: () => void;
};

const ImageExpand = ({
  imageURL,
  label,
  onClick,
}: Props): React.JSX.Element => {
  return createPortal(
    <figure
      onClick={onClick}
      className={styles.container}
      style={{
        '--bg-image': `url("${imageURL}")`,
      } as React.CSSProperties}
      role="button"
      aria-label="close expanded image"
      >
      <img
        title={label}
        className={styles.image}
        src={imageURL}
        alt={label}
      />
    </figure>,
    document.body,
  );
};

export default ImageExpand;
