import { useState } from 'react';
import MusicIcon from '../assets/Music Map Icon.png';
import InteractiveIcon from '../assets/Interactive Map Icon.png';
import VideoIcon from '../assets/Video Map Icon.png';
import ArtIcon from '../assets/Art Map Icon.png';
import PhotosIcon from '../assets/Photos Map Icon.png';

const icons = {
  "music": MusicIcon,
  "interactive": InteractiveIcon,
  "video": VideoIcon,
  "art": ArtIcon,
  "photos": PhotosIcon,
}

const ProjectIcon = (props) => {
  const { project, fullX, fullY, setOpenProject } = props;
  const [hovered, setHovered] = useState(false);

  return (
    <div className="projectIconFull" style={{
      position: "absolute",
      left: `calc(${(project.position[0] / 100) * fullX}px - 33px)`,
      top: `calc(${(project.position[1] / 100) * fullY}px - 33px)`,
      '--glide-delay': `${Math.random() * 0.08}s`,
      zIndex: hovered ? 3 : 2
    }}>
      <img className="projectIcon" src={icons[project.icon] || MusicIcon} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => setOpenProject(project._id)}/>
      {hovered &&
        <div className="projectTooltip">
          {project.name.toUpperCase()}
        </div>
      }
    </div>
  );
}

export default ProjectIcon;