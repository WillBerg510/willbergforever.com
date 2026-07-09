import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from "react";
import projectsAPI from "../api/ProjectsAPI.js";
import regions from "../constants/regions.js";
import "../stylesheets/Player.css";

const Player = ({ project_id }) => {
  const [contentReady, setContentReady] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [looping, setLooping] = useState(false);
  const queryClient = useQueryClient();

  const audioRef = useRef(null);
  const durationRef = useRef(0);
  const slidingRef = useRef(false);

  const { data: project } = useQuery({
    queryKey: [`project-${project_id}`],
    queryFn: () => {
      return projectsAPI.getProject(project_id).then(res => {
        res.data.project.date = new Date(res.data.project.date);
        return res.data.project;
      });
    }
  });

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setPosition(0);
        setPlaying(false);
      }
    }
  }, []);

  useEffect(() => {
    slidingRef.current = sliding;
  }, [sliding]);

  useEffect(() => {
    if (project?.contentType == "audio") {
      const audio = new Audio(project.content[0]);
      audioRef.current = audio;

      const handleTimeUpdate = () => {
        if (!slidingRef.current) {
          setPosition(Math.min(durationRef.current, audio.currentTime));
        }
      };

      const handleAudioEnd = () => {
        setPlaying(false);
      };

      const handleAudioLoad = () => {
        setDuration(Math.floor(audio.duration));
        durationRef.current = Math.floor(audio.duration);
        onContentReady();
      }

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleAudioEnd);
      audio.addEventListener('loadedmetadata', handleAudioLoad);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleAudioEnd);
        audio.removeEventListener('loadedmetadata', handleAudioLoad);
      };
    }
  }, [project?.content]);

  const playPause = () => {
    if (!playing) {
      if (position >= duration) rewind();
      audioRef.current.play();
      setPlaying(true);
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
  };

  const rewind = () => {
    audioRef.current.currentTime = 0;
    setPosition(0);
  };

  const loop = () => {
    audioRef.current.loop = !audioRef.current.loop;
    setLooping(!looping);
  }

  const changePosition = (e) => {
    setPosition(e.target.value);
  };

  const positionMouseDown = () => {
    slidingRef.current = true;
    setSliding(true);
  }

  const positionMouseUp = () => {
    audioRef.current.currentTime = position;
    if (position >= duration) {
      if (looping) {
        rewind();
      } else {
        audioRef.current.pause();
        setPlaying(false);
      }
    }
    slidingRef.current = false;
    setSliding(false);
  };

  const onContentReady = () => {
    window.requestAnimationFrame(() => {
      setContentReady(prev => prev + 1);
    });
  };

  const receiveClick = (e) => {
    e.stopPropagation();
  };

  const galleryPrev = () => {
    setGalleryIndex(prev => prev == 0 ? project.content.length - 1 : prev - 1);
  };

  const galleryNext = () => {
    setGalleryIndex(prev => prev == project.content.length - 1 ? 0 : prev + 1);
  };

  return (
    <div style={{
      display: project ? "flex" : "none",
      '--project-color': regions.filter(region => region.code == project?.region.split("-")[0])[0]?.color || null,
    }} key={`${project_id}-player`} className="playerWindow" onClick={receiveClick}>
      {project && <div className="projectPlayer">
        <h1 className="playerTitle">{project.name.toUpperCase()}</h1>
        <div className={`playerContent ${(contentReady >= project.content.length) && "playerContentReady"}`}>
          {project.contentType == "video" ? <video className="playerImage" controls src={project.content[0]} onLoadedData={onContentReady} />
          : <img className="playerImage" onLoad={onContentReady} src={project.contentType == "audio" ? project.content[1] : project.content[0]} />
          }
        </div>
        <div className={`playerControls ${(contentReady >= project.content.length) && "playerControlsReady"}`}>
          {project.contentType == "audio" ? <>
            <div className="playerControlsTop">
              <button className="playerControl" onClick={rewind}>Rewind</button>
              <button className="playerControl" onClick={playPause}>{playing ? "Pause" : "Play"}</button>
              <button className="playerControl" onClick={loop}>{!looping ? "Loop" : "No Loop"}</button>
            </div>
            <div className="playerControlsBottom">
              <p className="playerSliderText playerSliderLeft">
                {Math.floor(position / 60)}:{Math.floor(position % 60).toString().padStart(2, "0")}
              </p>
              {audioRef.current && <input
                className="playerSlider"
                style={{ '--slider-progress': `${duration > 0 ? (position / duration) * 100 : 0}%` }}
                type="range"
                min="0"
                step="0.001"
                max={duration}
                value={position}
                onChange={changePosition}
                onMouseDown={positionMouseDown}
                onTouchStart={positionMouseDown}
                onTouchEnd={positionMouseUp}
                onMouseUp={positionMouseUp}
              />}
              <p className="playerSliderText playerSliderRight">
                {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, "0")}
              </p>
            </div>
          </> : null}
        </div>
        {/*project.content.length > 0 && (
          project.contentType == "image" ? <img height="550" src={project.content[0]} onLoad={onContentReady} />
          : project.contentType == "audio" ? <audio controls src={project.content[0]} onLoadedData={onContentReady} />
          : project.contentType == "video" ? <video controls height="550" src={project.content[0]} onLoadedData={onContentReady} />
          : project.contentType == "gallery" ? <div>
            {contentReady != project.content.length && project.content.map((image, index) => <img src={project.content[index]} onLoad={onContentReady} />)}
            <img height="400" src={project.content[galleryIndex]} />
            <h2 className="contentName">{project.contentNames[galleryIndex]}</h2>
            <button onClick={galleryPrev}>Prev</button>
            <button onClick={galleryNext}>Next</button>
            <p />
          </div>
          : null
        )*/}
      </div>}
    </div>
  );
};

export default Player;