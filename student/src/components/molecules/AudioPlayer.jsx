import { useState, useRef, useEffect } from 'react';
import { Button } from '../atoms/Button.jsx';
import { ProgressBar } from '../atoms/ProgressBar.jsx';
import './AudioPlayer.css';

export function AudioPlayer({ src, title }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src} preload="metadata" />

      {title && <div className="audio-player__title">{title}</div>}

      <div className="audio-player__controls">
        <Button
          variant="ghost"
          size="large"
          onClick={togglePlay}
          icon={isPlaying ? '⏸️' : '▶️'}
        />

        <div className="audio-player__progress">
          <span className="audio-player__time">{formatTime(currentTime)}</span>
          <div
            className="audio-player__seek-bar"
            onClick={handleSeek}
          >
            <ProgressBar
              value={currentTime}
              max={duration}
              variant="primary"
              size="small"
            />
          </div>
          <span className="audio-player__time">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
