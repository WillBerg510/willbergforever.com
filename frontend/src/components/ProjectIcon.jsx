import { useState } from 'react';
import MusicIcon from '../assets/Music Map Icon.png';
import InteractiveIcon from '../assets/Interactive Map Icon.png';
import VideoIcon from '../assets/Video Map Icon.png';
import ArtIcon from '../assets/Art Map Icon.png';
import PhotosIcon from '../assets/Photos Map Icon.png';
import ExitArrow from '../assets/Exit Icon.png';
import HomeIcon from '../assets/Home Icon.png';

const icons = {
  "music": MusicIcon,
  "interactive": InteractiveIcon,
  "video": VideoIcon,
  "art": ArtIcon,
  "photos": PhotosIcon,
}

const ProjectIcon = (props) => {
  const { project, setOpenProject, division, setFocusDivision, otherDivision, leaveRegion } = props;
  const [hovered, setHovered] = useState(false);

  return (
    <div className="projectIconFull" style={{
      position: "absolute",
      left: project ? `${project.position[0]}%` : division ? `${division.exit[0]}%` : "calc(100% + 2em)",
      top: project ? `${project.position[1]}%` : division ? `${division.exit[1]}%` : "50%",
      '--glide-delay': `${(division || project) ? Math.random() * 0.25 + 0.1 : 0.1}s`,
      zIndex: hovered ? 3 : 2,
    }}>
      {project && <img
        className="projectIcon"
        src={icons[project.icon] || MusicIcon}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setOpenProject(project._id)}
      />}
      {division && <div
        className="exitIconFull"
        onClick={() => setFocusDivision(otherDivision)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img className={`exitIcon ${hovered ? "exitIconHover" : ""}`} src={ExitArrow} style={{
          rotate: division ? `${Math.atan2(-1 * division.direction[1], -1 * division.direction[0])}rad` : null,
        }}/>
        <p className={`exitText ${hovered ? "exitTextHover" : ""}`}>TO {otherDivision?.name.toUpperCase()}</p>
        <p className={`exitText exitTextOriginal`}>TO {otherDivision?.name.toUpperCase()}</p>
      </div>}
      {(!project && !division) && <div
        className="returnIconFull"
        onClick={leaveRegion}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img className={`returnIcon ${hovered ? "returnIconHover" : ""}`} src={HomeIcon} />
        <p className={`returnText ${hovered ? "returnTextHover" : ""}`}>RETURN TO FULL MAP</p>
      </div>}
      {hovered && project &&
        <div className="projectTooltip">
          <div className="projectTooltipBox">
            <p>
              {project.name.toUpperCase()}
            </p>
          </div>
          <div className="projectTriangle"/>
        </div>
      }
    </div>
  );
}

export default ProjectIcon;