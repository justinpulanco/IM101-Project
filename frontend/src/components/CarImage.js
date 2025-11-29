import React, { useState } from 'react';

const CarImage = ({ src, alt, className, fallbackSrc = '/default-car.png' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const imageSrc = hasError || !src ? fallbackSrc : src;
  const altText = alt || 'Car image';

  return (
    <div className={`car-image-container ${className || ''}`}>
      {isLoading && (
        <div className="image-placeholder">
          <div className="loading-spinner"></div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={altText}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: isLoading ? 'none' : 'block' }}
        className="car-image"
      />
    </div>
  );
};

export default CarImage;
