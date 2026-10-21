import '../stylesheets/DailyRaces.css';
import { useQuery } from '@tanstack/react-query';
import racesAPI from '../api/RacesAPI';
import raceLevels from '../constants/raceLevels';

const formatRaceTime = (time) => {
  if (time == null) return "--:--";

  const minutes = Math.floor(time / 60);
  const seconds = String(time % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const DailyRaces = (props) => {
  const { closeWindows, getRace } = props;

  const { data: races } = useQuery({
    queryKey: ["races"],
    queryFn: () => racesAPI.getRaces().then(res => res?.data?.races)
  });

  const startRace = (level) => {
    getRace(level);
    closeWindows();
  };

  return (
    <div className="dailyRacesBox" onClick={(e) => e.stopPropagation()}>
      <div className="dailyRacesCloseButton" onClick={closeWindows}>
        <p>CLOSE</p>
      </div>
      <h2 className="dailyRacesHeader">BOB'S DAILY RACES</h2>
      {races && Object.entries(raceLevels).map(([level, number]) => {
        const race = races.find(race => race.level == number);
        return (
          <div
            className="raceDiv"
            key={level}
            onClick={() => !race.userTime && startRace(number)}
          >
            <div className="raceDivLeft">
              <h3 className="raceDivTitle">{level.toUpperCase()} RACE</h3>
              <p className="raceDivSubtitle">PLAYED BY {race?.numUsers} USER{race?.numUsers != 1 && 'S'} TODAY</p>
            </div>
            <div className="raceDivRight">
              <div className="raceTime">
                <p className="raceTimeTitle">YOUR TIME</p>
                <p className="raceTimeText">{formatRaceTime(race?.userTime)}</p>
              </div>
              <div className="raceTime">
                <p className="raceTimeTitle">TODAY'S BEST</p>
                <p className="raceTimeText">{formatRaceTime(race?.bestTime)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DailyRaces;
