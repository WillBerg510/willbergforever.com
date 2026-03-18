import { useState } from 'react';

const ProjectIcon = (props) => {
  const { project, fullX, fullY, setOpenProject } = props;
  const [hovered, setHovered] = useState(false);

  return (
    <div className="projectIconFull" style={{
      position: "absolute",
      left: `calc(${(project.position[0] / 100) * fullX}px - 80px)`,
      top: `calc(${(project.position[1] / 100) * fullY}px - 30px)`,
    }}>
      <div className="projectIcon" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => setOpenProject(project._id)}>
        <h2>{project.icon.toUpperCase()}</h2>
      </div>
      {hovered &&
        <div className="projectTooltip">
          {project.name.toUpperCase()}
        </div>
      }
    </div>
  );
}

export default ProjectIcon;