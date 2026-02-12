import { useState, useRef } from 'react';
import { Icon } from '../atoms/Icon';
import './AudioPlaylist.css';

export function AudioPlaylist({ audioFiles }) {
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const audioRefs = useRef({});

  if (!audioFiles || audioFiles.length === 0) {
    return null;
  }

  const handlePlayPause = (index) => {
    const audio = audioRefs.current[index];

    if (currentPlaying === index) {
      // Pause current
      audio.pause();
      setCurrentPlaying(null);
    } else {
      // Pause any currently playing audio
      if (currentPlaying !== null && audioRefs.current[currentPlaying]) {
        audioRefs.current[currentPlaying].pause();
      }
      // Play new audio
      audio.play();
      setCurrentPlaying(index);
    }
  };

  const handleEnded = () => {
    setCurrentPlaying(null);
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-playlist">
      <div className="audio-playlist__header">
        <Icon name="music" size="small" />
        <h4 className="audio-playlist__title">Audio ({audioFiles.length})</h4>
      </div>

      <div className="audio-playlist__list">
        {audioFiles.map((audio, index) => (
          <div
            key={audio.id || index}
            className={`audio-playlist__item ${currentPlaying === index ? 'audio-playlist__item--playing' : ''}`}
          >
            <button
              className="audio-playlist__play-button"
              onClick={() => handlePlayPause(index)}
              aria-label={currentPlaying === index ? 'Pause' : 'Play'}
            >
              <Icon
                name={currentPlaying === index ? 'pause' : 'play'}
                size="small"
              />
            </button>

            <div className="audio-playlist__info">
              <div className="audio-playlist__name">
                {audio.title || `Audio ${index + 1}`}
              </div>
              {audio.duration_seconds && (
                <div className="audio-playlist__duration">
                  {formatDuration(audio.duration_seconds)}
                </div>
              )}
            </div>

            <audio
              ref={(el) => (audioRefs.current[index] = el)}
              src={audio.audioBase64 || audio.url}
              onEnded={handleEnded}
              onPause={() => {
                if (currentPlaying === index) {
                  setCurrentPlaying(null);
                }
              }}
              onPlay={() => setCurrentPlaying(index)}
              preload="metadata"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
