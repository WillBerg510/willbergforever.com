import MusicIcon from '../assets/Music Icon.png';
import InteractiveIcon from '../assets/Interactive Icon.png';
import VideoIcon from '../assets/Video Icon.png';
import ArtIcon from '../assets/Art Icon.png';
import PhotosIcon from '../assets/Photos Icon.png';
import ViewIcon from '../assets/View.svg';
import LinkIcon from '../assets/Globe.svg';
import PrevIcon from '../assets/Back.svg';
import NextIcon from '../assets/Play.svg';
import projectGroups from '../constants/projectGroups.js';
import { motion, AnimatePresence } from 'motion/react';
import '../stylesheets/GroupList.css';
import { useEffect, useRef, useState } from "react";

const icons = {
  "music": MusicIcon,
  "interactive": InteractiveIcon,
  "video": VideoIcon,
  "art": ArtIcon,
  "photos": PhotosIcon,
}

const GroupList = (props) => {
  const {group, groupProjects, setOpenProject, setOpenPlayer, getGroupProjects, setMenu} = props;
  const groups = Object.entries(projectGroups);
  const currentGroupIndex = groups.findIndex(([groupId, groupInfo]) => groupInfo.name == group);
  const currentGroup = groups[currentGroupIndex]?.[1];

  const changeGroup = (offset) => {
    const nextIndex = (currentGroupIndex + offset + groups.length) % groups.length;
    const [groupId, groupInfo] = groups[nextIndex];
    setMenu(groupInfo.name);
    getGroupProjects(groupId);
  };

  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [hasTopFade, setHasTopFade] = useState(false);
  const [hasBottomFade, setHasBottomFade] = useState(false);
  const groupListRef = useRef(null);

  useEffect(() => {
    const groupList = groupListRef.current;
    if (!groupList) return;

    const updateFadeState = () => {
      setHasTopFade(groupList.scrollTop > 0);
      setHasBottomFade(groupList.scrollTop + groupList.clientHeight < groupList.scrollHeight - 1);
    };

    updateFadeState();
    groupList.addEventListener('scroll', updateFadeState);
    const resizeObserver = new ResizeObserver(updateFadeState);
    resizeObserver.observe(groupList);

    return () => {
      groupList.removeEventListener('scroll', updateFadeState);
      resizeObserver.disconnect();
    };
  }, [imagesLoaded, groupProjects?.length]);

  useEffect(() => {
    setImagesLoaded(0);
  }, [group]);

  const openPlayer = (event, projectId, projectLink) => {
    event.stopPropagation();
    if (projectLink) {
      window.open(projectLink, "_blank");
    } else {
      setOpenPlayer(projectId);
    }
  };

  const onImageLoad = () => {
    setImagesLoaded(prev => prev + 1);
  }

  return (
    <motion.div
      className="groupFull"
      initial={{opacity: 0}}
      animate={{opacity: 1, transition: {duration: 0.25, ease: "easeInOut", delay: 0.15}}}
      exit={{opacity: 0, transition: {duration: 0.2, ease: "easeInOut"}}}
    >
      <div className="groupHeading">
        <button className="groupNavButton groupNavLeft" type="button" onClick={() => changeGroup(-1)}>
          <img src={PrevIcon} />
          <span>{groups[(currentGroupIndex - 1 + groups.length) % groups.length][1].name.toUpperCase()}</span>
        </button>
        <div className="groupHeadingName">
          <img src={currentGroup?.icon} alt="" />
          <h1>{group.toUpperCase()}</h1>
        </div>
        <button className="groupNavButton groupNavRight" type="button" onClick={() => changeGroup(1)}>
          <span>{groups[(currentGroupIndex + 1) % groups.length][1].name.toUpperCase()}</span>
          <img src={NextIcon} />
        </button>
      </div>
      <AnimatePresence mode="wait">
        {groupProjects && 
          <motion.div
            className={`groupList${hasTopFade ? ' hasTopFade' : ''}${hasBottomFade ? ' hasBottomFade' : ''}`}
            key={`${group}Group`}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.15,
                ease: "easeInOut",
              }
            }}
          >
            <div className="groupListScroller" ref={groupListRef} style={{display: imagesLoaded >= groupProjects.length * 2 ? "flex" : "none"}}>
              {groupProjects.map(project => <div className="listProject" onClick={() => setOpenProject(project._id)}>
                <div className="listProjectThumbnailContainer">
                  <img className="listProjectThumbnail" src={project.thumbnail} onLoad={onImageLoad} />
                </div>
                <div className="listProjectInfo">
                  <div className="listProjectHeader">
                    <img className="listProjectIcon" src={icons[project.icon]} onLoad={onImageLoad} />
                    <h2 className="listProjectName">{project.name}</h2>
                  </div>
                  <p className="listProjectDate">{project.date.toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}</p>
                </div>
                {(project.contentType || project.links?.link || project.links?.spotify || project.links?.youtube) &&
                  <button className="listProjectButton" onClick={(event) => openPlayer(event, project._id, !project.contentType ? project.links.link || project.links.youtube || project.links.spotify : null)}>
                    <img src={project.contentType ? ViewIcon : LinkIcon} />
                  </button>
                }
              </div>)}
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </motion.div>
  )
}

export default GroupList;