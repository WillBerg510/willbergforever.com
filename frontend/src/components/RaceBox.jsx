import '../stylesheets/RaceBox.css';
import { useEffect, useState } from 'react';

const RaceBox = (props) => {
  const { projects, startTime } = props;
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const updateElapsedTime = () => {
      setElapsedTime(Math.floor((performance.now() - startTime) / 1000));
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 10);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="raceBox">
      <p className="raceBoxTime">TIME: {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}</p>
      {projects.map((project) => (
        <p className="raceBoxItem" key={project.name} style={project.found && {textDecoration: 'line-through'}}>
          {project.name}
        </p>
      ))}
    </div>
  );
};

export default RaceBox;