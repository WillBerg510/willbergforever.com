import '../stylesheets/Island.css';
import RegionName from './RegionName.jsx';
import ProjectIcon from './ProjectIcon.jsx';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import projectsAPI from '../api/ProjectsAPI.js';
import regions from '../constants/regions.js';
import SmileIsle from '../assets/Smile Isle.jpg';

const Island = (props) => {
  const { setOpenProject, setOpenMiscWindow, isAdmin } = props;
  const [focusRegion, setFocusRegion] = useState(null);
  const [focusDivision, setFocusDivision] = useState(null);
  const [loadedDivision, setLoadedDivision] = useState(null);
  const [isDivisionExiting, setIsDivisionExiting] = useState(false);
  const islandRef = useRef(null);

  const enterRegion = (region) => {
    if (!region.direction) {
      if (region.holdsProjects) {
        setFocusRegion(region);
      } else {
        setOpenMiscWindow(region.code);
      }
    } else {
      setFocusDivision(region);
    }
  }

  const { data: regionProjects, mutate: getRegionProjects } = useMutation({
    mutationFn: () => focusDivision ? projectsAPI.getFromRegion(`${focusRegion.code}-${focusDivision.code}`)
    .then(res => res?.data?.projects.filter(project => project.visible != false || isAdmin)) : null,
  });

  useEffect(() => {
    if (!focusDivision?.projects) getRegionProjects();
    if (focusDivision && !focusDivision.image) setLoadedDivision(focusDivision);
    if (focusDivision) setIsDivisionExiting(false);
  }, [focusDivision]);

  useEffect(() => {
    if (regionProjects) setFocusDivision(prev => {return {...prev, projects: regionProjects}});
  }, [regionProjects]);

  const leaveRegion = () => {
    if (loadedDivision) setIsDivisionExiting(true);
    setFocusRegion(null);
    setFocusDivision(null);
  };

  return (
    <div className="island" ref={islandRef}>
      <AnimatePresence mode="wait">
        {!focusDivision && <motion.div
          className="smileIsle"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            scale: focusRegion ? focusRegion.zoom[0] : 1,
            x: focusRegion ? focusRegion.zoom[1] * focusRegion.zoom[0] : 0,
            y: focusRegion ? focusRegion.zoom[2] * focusRegion.zoom[0] : 0,
            transition: {ease: [.67, 0, .33, 1], duration: 0.5},
          }}
          exit={{
            opacity: 0,
            transition: {ease: "easeInOut", duration: 0.2},
          }}
        >
          <AnimatePresence>
            {!focusRegion && regions.map(region => <RegionName key={region.name} region={region} enterRegion={enterRegion} visible={!focusRegion} />)}
          </AnimatePresence>
          <div className="regionDivisions" style={{
            scale: 1 / focusRegion?.zoom[0]
          }}>
            <AnimatePresence>
              {!focusDivision && focusRegion && focusRegion.divisions?.map(division => <RegionName key={`${focusRegion.code}${division.code}`} region={division} enterRegion={enterRegion} />)}
            </AnimatePresence>
          </div>
          <img key={`${focusRegion?.name}-image` || "isle-image"} className="islandImage" draggable="false" src={SmileIsle} />
        </motion.div>}
      </AnimatePresence>
      {focusRegion &&
        <div className="regionHeader">
          {isAdmin && <button className="returnFromRegion refreshButton" onClick={() => getRegionProjects()}>
            REFRESH
          </button>}
          <h2 className="regionHeaderName">{focusRegion.name.toUpperCase()}</h2>
          <h3 className={`divisionHeaderName ${!focusDivision && "divisionHeaderHidden"}`}>{focusDivision ? focusDivision.name.toUpperCase() : "A"}</h3>
          {focusRegion && <ProjectIcon key="returnIcon" leaveRegion={leaveRegion} />}
        </div>
      }
      {focusDivision && focusDivision.projects && (focusDivision != loadedDivision) && focusDivision.image &&
        <img src={focusDivision.image} style={{display: "none"}} onLoad={() => {
          setLoadedDivision(focusDivision);
        }}/>
      }
      {loadedDivision && <motion.div
        className="regionPresence"
        initial={{opacity: 0}}
        animate={{opacity: isDivisionExiting ? 0 : 1, transition: {duration: 0.2, ease: "easeInOut"}}}
        onAnimationComplete={() => {
          if (isDivisionExiting) {
            setLoadedDivision(null);
            setIsDivisionExiting(false);
          }
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            className="regionDivision"
            key={loadedDivision.name}
            initial={{
              opacity: 0,
              x: loadedDivision.direction ? loadedDivision.direction[0] : 0,
              y: loadedDivision.direction ? loadedDivision.direction[1] : 0,
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: 0,
              transition: {ease: [.1, .5, .67, 1], duration: 0.3},
            }}
            exit={{
              opacity: 0,
              x: loadedDivision.direction ? loadedDivision.direction[0] : 0,
              y: loadedDivision.direction ? loadedDivision.direction[1] : 0,
              transition: {ease: [.5, 0, 1, .67], duration: 0.2},
            }}
          >
            {loadedDivision?.projects && loadedDivision.projects.map(project =>
              <ProjectIcon key={project.name} project={project} setOpenProject={setOpenProject} />
            )}
            {loadedDivision?.image &&
              <img key={`${loadedDivision.name}-image`} className="islandImage" src={loadedDivision.image} draggable="false" alt="" />
            }
            {loadedDivision?.exit &&
              <ProjectIcon key={`${loadedDivision.name}-exit`} division={loadedDivision} setFocusDivision={setFocusDivision} otherDivision={focusRegion?.divisions.filter(division => division.name != loadedDivision.name)[0]} />
            }
          </motion.div>
        </AnimatePresence>
      </motion.div>}
    </div>
  );
}

export default Island;