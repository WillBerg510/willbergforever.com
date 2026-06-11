import '../stylesheets/Island.css';
import RegionName from './RegionName.jsx';
import ProjectIcon from './ProjectIcon.jsx';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import projectsAPI from '../api/ProjectsAPI.js';
import regions from '../constants/regions.js';

const Island = (props) => {
  const { setOpenProject, isAdmin } = props;
  const [focusRegion, setFocusRegion] = useState(null);
  const [focusDivision, setFocusDivision] = useState(null);
  const [loadedDivision, setLoadedDivision] = useState(null);
  const islandRef = useRef(null);

  const enterRegion = (region) => {
    if (region.divisions) {
      setFocusRegion(region);
    } else {
      setFocusDivision(region);
    }
  }

  const { data: regionProjects, mutate: getRegionProjects } = useMutation({
    mutationFn: () => focusDivision ? projectsAPI.getFromRegion(`${focusRegion.code}-${focusDivision.code}`).then(res => res?.data?.projects) : null,
  });

  useEffect(() => {
    if (!focusDivision?.projects) getRegionProjects();
    if (!focusDivision?.image) setLoadedDivision(focusDivision);
  }, [focusDivision]);

  useEffect(() => {
    if (regionProjects) setFocusDivision(prev => {return {...prev, projects: regionProjects}});
  }, [regionProjects]);

  const leaveRegion = () => {
    setFocusRegion(null);
    setFocusDivision(null);
  };

  return (
    <div className="island" ref={islandRef}>
      {!focusDivision && !focusRegion && regions.map(region => <RegionName key={region.name} region={region} enterRegion={enterRegion} />)}
      {!focusDivision && focusRegion &&
        <div className="region">
          {focusRegion.divisions.map(division => <RegionName key={`${focusRegion.code}${division.code}`} region={division} enterRegion={enterRegion} />)}
          <button className="returnFromRegion" onClick={leaveRegion}>Return to Full Map</button>
        </div>
      }
      {focusDivision &&
        <div className="divisionButtons">
          <button className="returnFromRegion" onClick={leaveRegion}>Return to Full Map</button>
          {isAdmin && <button className="otherRegion" onClick={() => getRegionProjects()}>
            Refresh
          </button>}
        </div>
      }
      {focusDivision && focusDivision.projects && (focusDivision != loadedDivision) && focusDivision.image &&
        <img src={focusDivision.image} style={{display: "none"}} onLoad={() => {
          setLoadedDivision(focusDivision);
        }}/>
      }
      {loadedDivision && focusDivision &&
        <div className="regionPresence">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              className="regionDivision"
              key={loadedDivision.name}
              initial={{
                opacity: 0,
                x: loadedDivision.direction[0],
                y: loadedDivision.direction[1],
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                transition: {ease: [.1, .5, .67, 1], duration: 0.2},
              }}
              exit={{
                opacity: 0,
                x: loadedDivision.direction[0],
                y: loadedDivision.direction[1],
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
                <ProjectIcon key={`${loadedDivision.name}-exit`} division={loadedDivision} setFocusDivision={setFocusDivision} otherDivision={focusRegion.divisions.filter(division => division.name != loadedDivision.name)[0]} />
              }
            </motion.div>
          </AnimatePresence>
        </div>
      }
    </div>
  );
}

export default Island;