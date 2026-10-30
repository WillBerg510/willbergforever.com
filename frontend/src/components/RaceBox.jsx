import '../stylesheets/RaceBox.css';
import { useEffect, useState } from 'react';

const RaceBox = (props) => {
  const { projects, startTime, setStartTime, raceResults } = props;
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (startTime == -1) {
      setTimeout(() => {
        setStartTime(performance.now());
      }, 2500);
    }

    const updateElapsedTime = () => {
      setElapsedTime(Math.floor((performance.now() - startTime) / 1000));
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 25);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className={`raceBox ${(startTime == -1) ? "raceBoxPrep" : raceResults ? "raceBoxResults" : "raceBoxCorner"}`}>
      <div className="raceBoxText">
        <p className="raceBoxPrepText">Find each of these projects as quickly as you can:</p>
        <p className="raceBoxTime">TIME: {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}</p>
        <p className="raceBoxResults">{Math.floor(raceResults / 60)}:{String(raceResults % 60).padStart(2, "0")}</p>
        <p className="raceBoxInstructions">Locate all of these projects:</p>
      </div>
      <div className="raceBoxItems">
        {projects.map((project) => (
          <p className={`raceBoxItem ${project.found && "found"}`} key={project.name}>
            {project.name.toUpperCase()}
          </p>
        ))}
      </div>
    </div>
  );
};

export default RaceBox;