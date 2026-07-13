import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from "react";
import projectsAPI from "../api/ProjectsAPI.js";
import regions from "../constants/regions.js";
import "../stylesheets/Player.css";
import PlayIcon from "../assets/Play.svg";
import PauseIcon from "../assets/Pause.svg";
import RewindIcon from "../assets/Rewind.svg";
import LoopIcon from "../assets/Loop.svg";
import FullscreenIcon from "../assets/Fullscreen.svg";
import ExitFullscreenIcon from "../assets/Exit Fullscreen.svg";

const Player = ({ project_id, closeWindows, setOpenProject }) => {
  const [contentReady, setContentReady] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [looping, setLooping] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [buttonsShown, setButtonsShown] = useState(false);
  const [contentType, setContentType] = useState(null);
  const queryClient = useQueryClient();

  const mediaRef = useRef(null);
  const durationRef = useRef(0);
  const slidingRef = useRef(false);
  const playingRef = useRef(false);
  const positionRef = useRef(0);
  const loopingRef = useRef(false);
  const isFullscreenRef = useRef(false);
  const fullscreenRef = useRef(null);
  const buttonsRef = useRef(0);
  const buttonsHoverRef = useRef(false);
  const destructorRef = useRef(() => {});

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
    const handleFullscreenChange = () => {
      setFullscreen(document.fullscreenElement);
    }

    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        playPause();
        showButtons();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (mediaRef.current) {
        mediaRef.current.pause();
        setPosition(0);
        setPlaying(false);
      }
    }
  }, []);

  useEffect(() => {
    slidingRef.current = sliding;
  }, [sliding]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    loopingRef.current = looping;
  }, [looping]);

  useEffect(() => {
    isFullscreenRef.current = fullscreen;
  }, [fullscreen]);

  const processMedia = (media) => {
    const handleTimeUpdate = () => {
      if (!slidingRef.current) {
        setPosition(Math.min(durationRef.current, media.currentTime));
      }
    };

    const handleEnd = () => {
      setPlaying(false);
    };

    const handleLoad = () => {
      setDuration(Math.floor(media.duration));
      durationRef.current = Math.floor(media.duration);
      onContentReady();
    }

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('ended', handleEnd);
    if (contentType == "audio") media.addEventListener('loadedmetadata', handleLoad);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('ended', handleEnd);
      media.removeEventListener('loadedmetadata', handleLoad);
    };
  }

  useEffect(() => {
    if (project.contentType == "musicVideo") setContentType("video");
    else setContentType(project.contentType);
  }, [project?.content]);

  useEffect(() => {
    if (contentType == "audio") {
      const audio = new Audio(project.content[0 + (project.contentType == "musicVideo")]);
      mediaRef.current = audio;
      destructorRef.current = processMedia(audio);
    }
    return () => {
      if (destructorRef.current) destructorRef.current();
    }
  }, [contentType]);

  const rewind = () => {
    if (!mediaRef.current) return;

    mediaRef.current.currentTime = 0;
    setPosition(0);
    positionRef.current = 0;
  };

  const playPause = () => {
    if (!mediaRef.current) return;

    if (!playingRef.current) {
      if (positionRef.current >= durationRef.current) rewind();
      mediaRef.current.play();
      setPlaying(true);
    } else {
      mediaRef.current.pause();
      setPlaying(false);
    }
  };

  const loop = () => {
    mediaRef.current.loop = !mediaRef.current.loop;
    setLooping(prev => !prev);
    loopingRef.current = !loopingRef.current;
  };

  const showButtons = () => {
    if (!isFullscreenRef.current) return;
    setButtonsShown(true);
    const id = buttonsRef.current + 1;
    buttonsRef.current = id;
    setTimeout(() => {
      if (buttonsRef.current == id && !buttonsHoverRef.current) {
        setButtonsShown(false);
      }
    }, 2500);
  };

  const buttonsHover = () => {
    buttonsHoverRef.current = true;
    showButtons();
  }

  const toggleFullscreen = async () => {
    if (fullscreen) await document.exitFullscreen();
    else {
      await fullscreenRef.current.requestFullscreen();
      setButtonsShown(true);
      showButtons();
    }
  };

  const changePosition = (e) => {
    setPosition(e.target.value);
  };

  const positionMouseDown = () => {
    slidingRef.current = true;
    setSliding(true);
  };

  const positionMouseUp = () => {
    mediaRef.current.currentTime = position;
    if (position >= duration) {
      if (looping) {
        rewind();
      } else {
        mediaRef.current.pause();
        setPlaying(false);
      }
    }
    slidingRef.current = false;
    setSliding(false);
  };

  const onVideoLoaded = () => {
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        mediaRef.current.currentTime = 0.001;
      }, 300);
    });
  }

  const onContentReady = () => {
    window.requestAnimationFrame(() => {
      if (contentType == "video") {
        setDuration(Math.floor(mediaRef.current.duration));
        durationRef.current = Math.floor(mediaRef.current.duration);
        destructorRef.current = processMedia(mediaRef.current);
      }
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

  const backToProject = () => {
    closeWindows();
    setOpenProject(project_id);
  };

  const switchContentType = () => {
    mediaRef.current.pause();
    setPlaying(false);
    setContentReady(0);
    if (contentType == "audio") setContentType("video");
    else setContentType("audio");
    rewind();
  };

  return (
    <div style={{
      display: contentType ? "flex" : "none",
      '--project-color': regions.filter(region => region.code == project?.region.split("-")[0])[0]?.color || null,
    }} key={`${project_id}-player`} className="playerWindow" onClick={receiveClick}>
      {project && <div className="projectPlayer">
        <div className="playerHeader">
          <div className="playerHeaderButton" onClick={backToProject}>BACK</div>
          <h1 className="playerTitle">{project.name.toUpperCase()}</h1>
          <div className="playerHeaderButton" onClick={closeWindows}>CLOSE</div>
        </div>
        <div className={`playerContent ${(contentReady >= (contentType == "audio" ? 2 : contentType == "video" ? 1 : project.content.length)) && "playerContentReady"} ${fullscreen && "playerContentFullscreen"}`}>
          <div className={`fullscreenInterface ${fullscreen && "fullscreenInterfaceOpen"} ${fullscreen && !buttonsShown && "fullscreenInterfaceFocus"}`} ref={fullscreenRef} onMouseMove={showButtons} onClick={showButtons}>
            {contentType == "video" ? <video className="playerImage" ref={mediaRef} src={project.content[0]} onSeeked={onContentReady} onLoadedData={onVideoLoaded} onClick={playPause} />
            : <img className="playerImage" onLoad={onContentReady} src={project.content[(contentType == "audio") + (project.contentType == "musicVideo")]} onClick={playPause} />
            }
            {fullscreen && <div className={`fullscreenButtons ${!buttonsShown && "fullscreenButtonsHidden"} ${contentType == "image" && "fullscreenButtonsSmall"}`} onMouseEnter={buttonsHover} onMouseLeave={() => {buttonsHoverRef.current = false}}>
              {(contentType == "audio" || contentType == "video") && <>
                <div className="playerControl" onClick={rewind}><img className="playerControlIcon" src={RewindIcon} /></div>
                <div className="playerControl" onClick={playPause}><img src={playing ? PauseIcon : PlayIcon} className="playerControlIcon" /></div>
                <div className={`playerControl ${looping && "playerControlOn"}`} onClick={loop}><img src={LoopIcon} className="playerControlIcon" /></div>
                <p className="playerSliderText playerSliderLeft">
                  {Math.floor(position / 60)}:{Math.floor(position % 60).toString().padStart(2, "0")}
                </p>
                {mediaRef.current && <input
                  className="playerSlider"
                  style={{ '--slider-progress': `${duration > 0 ? (position / duration) * 100 : 0}%` }}
                  type="range"
                  min="0"
                  step="0.01"
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
              </>}
              <div className="playerControl" onClick={toggleFullscreen}><img src={ExitFullscreenIcon} className="playerControlIcon" /></div>
            </div>}
          </div>
        </div>
        <div className={`playerControls ${(contentReady >= (contentType == "audio" ? 2 : contentType == "video" ? 1 : project.content.length)) && "playerControlsReady"}`}>
          {(contentType == "audio" || contentType == "video") && <>
            <div className="playerControlsTop">
              <div className="playerControl" onClick={rewind}><img className="playerControlIcon" src={RewindIcon} /></div>
              <div className="playerControl" onClick={playPause}><img src={playing ? PauseIcon : PlayIcon} className="playerControlIcon" /></div>
              <div className={`playerControl ${looping && "playerControlOn"}`} onClick={loop}><img src={LoopIcon} className="playerControlIcon" /></div>
            </div>
            <div className="playerControlsBottom">
              <p className="playerSliderText playerSliderLeft">
                {Math.floor(position / 60)}:{Math.floor(position % 60).toString().padStart(2, "0")}
              </p>
              {mediaRef.current ? <input
                className="playerSlider"
                style={{ '--slider-progress': `${duration > 0 ? (position / duration) * 100 : 0}%` }}
                type="range"
                min="0"
                step="0.01"
                max={duration}
                value={position}
                onChange={changePosition}
                onMouseDown={positionMouseDown}
                onTouchStart={positionMouseDown}
                onTouchEnd={positionMouseUp}
                onMouseUp={positionMouseUp}
              /> : <input type="range" className="playerSlider" />}
              <p className="playerSliderText playerSliderRight">
                {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, "0")}
              </p>
            </div>
          </>}
          {project.contentType == "musicVideo" && <div className="playerSideButton playerSwitchButton" onClick={switchContentType}>
            <p>{contentType == "audio" ? "SWITCH TO VIDEO" : "SWITCH TO AUDIO"}</p>
          </div>}
          <div className="playerSideButton playerFullscreenButton" onClick={toggleFullscreen}><img className="playerSideButtonIcon" src={FullscreenIcon} /></div>
        </div>
        {/*project.content.length > 0 && (
          contentType == "image" ? <img height="550" src={project.content[0]} onLoad={onContentReady} />
          : contentType == "audio" ? <audio controls src={project.content[0]} onLoadedData={onContentReady} />
          : contentType == "video" ? <video controls height="550" src={project.content[0]} onLoadedData={onContentReady} />
          : contentType == "gallery" ? <div>
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