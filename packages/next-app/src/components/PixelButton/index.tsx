import React from 'react';

import styles from './PixelButton.module.css';

export const PixelButton = () => {
  return (
    <div>
      <div className={styles.container}>
        <div className={styles.pixel2}>
          pixelated button #2
          <br />
          with multiple lines
        </div>
      </div>
    </div>
  );
};
