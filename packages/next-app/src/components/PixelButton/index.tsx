import React from 'react';

import styles from './PixelButton.module.css';

export const PixelButton = ({
  text,
  onClick,
  openModal,
}: {
  text: string;
  onClick: () => void;
  openModal?: () => void | null;
}) => {
  return (
    <div onClick={openModal ?? onClick}>
      <div className={`${styles.container}`}>
        <div className={styles.pixel2}>{text}</div>
      </div>
    </div>
  );
};
