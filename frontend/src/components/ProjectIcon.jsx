import { useState } from 'react';
import MusicIcon from '../assets/Music Map Icon.png';
import InteractiveIcon from '../assets/Interactive Map Icon.png';
import VideoIcon from '../assets/Video Map Icon.png';
import ArtIcon from '../assets/Art Map Icon.png';
import PhotosIcon from '../assets/Photos Map Icon.png';
import ExitArrow from '../assets/Interactive Icon.png';

const icons = {
  "music": MusicIcon,
  "interactive": InteractiveIcon,
  "video": VideoIcon,
  "art": ArtIcon,
  "photos": PhotosIcon,
}

const ProjectIcon = (props) => {
  const { project, setOpenProject, division, setFocusDivision, otherDivision } = props;
  const [hovered, setHovered] = useState(false);

  return (
    <div className="projectIconFull" style={{
      position: "absolute",
      left: `${project ? project.position[0] : division.exit[0]}%`,
      top: `${project ? project.position[1] : division.exit[1]}%`,
      '--glide-delay': `${Math.random() * 0.2 + 0.1}s`,
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
          rotate: division ? `${Math.atan2(-1 * division.direction[1], -1 * division.direction[0]) + Math.PI/2.5}rad` : null,
        }}/>
        <p className={`exitText ${hovered ? "exitTextHover" : ""}`}>TO {otherDivision.name.toUpperCase()}</p>
      </div>}
      {hovered && project &&
        <div className="projectTooltip">
          <div className="projectTooltipBox">
            {project.name.toUpperCase()}
          </div>
          <div className="projectTriangle"/>
        </div>
      }
    </div>
  );
}

export default ProjectIcon;