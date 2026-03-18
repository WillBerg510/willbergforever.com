import '../stylesheets/Island.css';
import RegionName from './RegionName.jsx';
import ProjectIcon from './ProjectIcon.jsx';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import projectsAPI from '../api/ProjectsAPI.js';
import regions from '../constants/regions.js';

const Island = (props) => {
  const { setOpenProject } = props;
  const [fullX, setFullX] = useState(0);
  const [fullY, setFullY] = useState(0);
  const [focusRegion, setFocusRegion] = useState(null);
  const [focusDivision, setFocusDivision] = useState(null);
  const islandRef = useRef(null);
  
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      setFullX(entries[0].contentRect.width);
      setFullY(entries[0].contentRect.height);
    });

    resizeObserver.observe(islandRef?.current);
  }, []);

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
    getRegionProjects();
  }, [focusDivision]);

  return (
    <div className="island" ref={islandRef}>
      {!focusDivision && !focusRegion && regions.map(region => <RegionName key={region.name} region={region} fullX={fullX} fullY={fullY} enterRegion={enterRegion} />)}
      {!focusDivision && focusRegion &&
        <div className="region">
          {focusRegion.divisions.map(division => <RegionName key={`${focusRegion.code}${division.code}`} region={division} fullX={fullX} fullY={fullY} enterRegion={enterRegion} />)}
          <button className="returnFromRegion" onClick={() => setFocusRegion(null)}>Return to Full Map</button>
        </div>
      }
      {focusDivision &&
        <div className="regionDivision">
          {regionProjects && regionProjects.map(project =>
            <ProjectIcon key={project.name} project={project} fullX={fullX} fullY={fullY} setOpenProject={setOpenProject} />
          )}
          <button className="returnFromRegion" onClick={() => {setFocusRegion(null); setFocusDivision(null)}}>Return to Full Map</button>
          {focusRegion ? focusRegion.divisions.filter(division => division != focusDivision).map(division =>
            <button className="otherRegion" key={`other-${division.name}`} onClick={() => setFocusDivision(division)}>
              Go to {division.name}
            </button>
          ) : null}
        </div>
      }
    </div>
  );
}

export default Island;