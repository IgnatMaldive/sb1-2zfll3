import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import axios from 'axios';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number;
  cover: string;
  audioUrl: string;
}

export default function TangoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/tracks');
        setTracks(response.data);
      } catch (error) {
        console.error('Error fetching tracks:', error);
      }
    };
    fetchTracks();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleNext);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleNext);
    };
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeChange = (newTime: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime[0];
      setCurrentTime(newTime[0]);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100;
      setVolume(newVolume[0]);
    }
  };

  const handlePrevious = () => {
    setCurrentTrackIndex((prev) => 
      prev === 0 ? tracks.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => 
      prev === tracks.length - 1 ? 0 : prev + 1
    );
  };

  const currentTrack = tracks[currentTrackIndex];

  return (
    <div className="flex flex-col w-full max-w-md mx-auto bg-zinc-900 text-white p-6 rounded-lg shadow-lg">
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl}
        preload="metadata"
      />
      <div className="mb-6">
        <img
          src={currentTrack?.cover || '/placeholder.svg?height=300&width=300'}
          alt="Album cover"
          className="w-full aspect-square object-cover rounded-md shadow-md"
        />
      </div>
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold mb-1">{currentTrack?.title}</h2>
        <p className="text-zinc-400">{currentTrack?.artist}</p>
      </div>
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={handleTimeChange}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-zinc-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex justify-center items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white"
          onClick={handlePrevious}
          aria-label="Previous track"
        >
          <SkipBack className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full bg-white text-black hover:scale-105 transition",
            isPlaying && "bg-green-500"
          )}
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white"
          onClick={handleNext}
          aria-label="Next track"
        >
          <SkipForward className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Volume2 className="h-5 w-5 text-zinc-400" />
        <Slider
          value={[volume]}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="w-full"
        />
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}