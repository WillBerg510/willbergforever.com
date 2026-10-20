import '../stylesheets/DailyRaces.css';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import projectsAPI from '../api/ProjectsAPI';
import racesAPI from '../api/RacesAPI';

const levels = {
  "Easy": 3,
  "Medium": 4,
  "Hard": 5,
};

const DailyRaces = (props) => {
  const { closeWindows } = props;
  const [racesData, setRacesData] = useState({});
  const [raceCode, setRaceCode] = useState(null);

  const { mutate: getRace } = useMutation({
    mutationFn: (level) => projectsAPI.getRace(levels[level]),
    onSuccess: (res, level) => {
      const projects = res?.data?.projects;
      setRacesData(prev => ({...prev, [level]: projects}));
    },
  });

  const { mutate: initiateRace } = useMutation({
    mutationFn: () => racesAPI.initiateRace(3),
    onSuccess: (res) => {
      const code = res?.data?.code;
      if (code) setRaceCode(code);
    }
  });

  const { mutate: submitRace } = useMutation({
    mutationFn: () => racesAPI.submitRace(3, 20, raceCode),
    onSuccess: () => {
      alert("Submitted");
    },
    onError: (error) => {
      const message = error.response?.data?.error
        ?? error.response?.data
        ?? error.message;
      alert(message);
    },
  });

  return (
    <div className="dailyRacesBox" onClick={(e) => e.stopPropagation()}>
      <div className="dailyRacesCloseButton" onClick={closeWindows}>
        <p>CLOSE</p>
      </div>
      <h2 className="dailyRacesHeader">BOB'S DAILY RACES</h2>
      <div>
        <button type="button" onClick={() => initiateRace()}>
          INITIATE LEVEL 3
        </button>
        <button type="button" onClick={() => submitRace()}>
          SUBMIT LEVEL 3 SCORE 20
        </button>
      </div>
      {Object.keys(levels).map(level => <div
        className="raceDiv"
        onClick={() => getRace(level)}
      >
        <div className="raceDivLeft">
          <h3 className="raceDivTitle">{level.toUpperCase()} RACE</h3>
          <p className="raceDivSubtitle">PLAYED BY 5 USERS TODAY</p>
        </div>
        <div className="raceDivRight">
          <div className="raceTime">
            <p className="raceTimeTitle">YOUR TIME</p>
            <p className="raceTimeText">0:56</p>
          </div>
          <div className="raceTime">
            <p className="raceTimeTitle">TODAY'S BEST</p>
            <p className="raceTimeText">0:42</p>
          </div>
        </div>
      </div>)}
      <div style={{display: "flex", gap: "30px", zIndex: "4", justifyContent: "center", flexWrap: "wrap", margin: "20px 0"}}>
        {Object.keys(levels).map(level => 
          racesData[level] && (
          <div style={{border: "1px solid #ccc", padding: "10px", borderRadius: "5px"}}>
            <h3>{level} Race Projects</h3>
            <ul>
              {racesData[level].map((project) => (
                <li style={{textAlign: "left"}} key={project._id}>{project.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DailyRaces;
