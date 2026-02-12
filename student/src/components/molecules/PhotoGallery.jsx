import { useState } from 'react';
import './PhotoGallery.css';

export function PhotoGallery({ photos }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return null;
  }

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'ArrowLeft') goToPrevious();
  };

  const handleTouchStart = (e) => {
    const touchStartX = e.touches[0].clientX;
    e.currentTarget.setAttribute('data-touch-start', touchStartX);
  };

  const handleTouchEnd = (e) => {
    const touchStartX = parseFloat(e.currentTarget.getAttribute('data-touch-start'));
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  return (
    <div className="photo-gallery">
      <div className="photo-gallery__grid">
        {photos.map((photo, index) => (
          <div
            key={photo.id || index}
            className="photo-gallery__item"
            onClick={() => openLightbox(index)}
          >
            <img
              src={photo.imageBase64 || photo.preview || photo.url}
              alt={photo.title || `Photo ${index + 1}`}
              className="photo-gallery__thumbnail"
            />
            {photo.title && (
              <div className="photo-gallery__title">{photo.title}</div>
            )}
          </div>
        ))}
      </div>

      {lightboxOpen && (
        <div
          className="photo-gallery__lightbox"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            className="photo-gallery__close"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ×
          </button>

          <button
            className="photo-gallery__nav photo-gallery__nav--prev"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            aria-label="Previous"
            disabled={photos.length === 1}
          >
            ‹
          </button>

          <div
            className="photo-gallery__content"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={photos[currentIndex].imageBase64 || photos[currentIndex].preview || photos[currentIndex].url}
              alt={photos[currentIndex].title || `Photo ${currentIndex + 1}`}
              className="photo-gallery__image"
            />
            {photos[currentIndex].title && (
              <div className="photo-gallery__caption">
                {photos[currentIndex].title}
              </div>
            )}
            <div className="photo-gallery__counter">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>

          <button
            className="photo-gallery__nav photo-gallery__nav--next"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Next"
            disabled={photos.length === 1}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
