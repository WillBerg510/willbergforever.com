import '../stylesheets/DailyRaces.css';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import racesAPI from '../api/RacesAPI';
import raceLevels from '../constants/raceLevels';

const framerate = 20.5;

const bobAnimationFrames = Object.entries(
  import.meta.glob('../assets/Bob Animation/Bob*.png', {
    eager: true,
    import: 'default',
    query: '?url'
  })
).sort(([firstFrame], [secondFrame]) =>
  firstFrame.localeCompare(secondFrame, undefined, { numeric: true })
).map(([, frame]) => frame);

const formatRaceTime = (time) => {
  if (time == null) return "--:--";

  const minutes = Math.floor(time / 60);
  const seconds = String(time % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const DailyRaces = (props) => {
  const { closeWindows, getRace } = props;
  const [animationLoaded, setAnimationLoaded] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    Promise.all(bobAnimationFrames.map((frame) => new Promise((resolve, reject) => {
      const image = new window.Image();
      image.onload = resolve;
      image.src = frame;
    }))).then(() => {
      setAnimationLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!animationLoaded) return;

    let animationFrames = Array.from({ length: 37 }, (_, index) => index);
    let animationStart;
    let animationFrame;

    const updateAnimation = (timestamp) => {
      if (animationStart == null) animationStart = timestamp;

      let elapsed = timestamp - animationStart;
      const frameDuration = 1000 / framerate;

      if (elapsed >= animationFrames.length * frameDuration) {
        const animationDuration = animationFrames.length * frameDuration;
        animationStart += animationDuration;
        elapsed -= animationDuration;
        animationFrames = [
          ...Array.from(
            { length: Math.floor(Math.random() * 6) + 7 },
            () => Array.from({ length: 8 }, (_, index) => index + 37)
          ).flat(),
          ...Array.from({ length: 8 }, (_, index) => index + 45)
        ];
      }

      setCurrentFrame(animationFrames[Math.floor(elapsed / frameDuration)]);
      animationFrame = window.requestAnimationFrame(updateAnimation);
    };

    setTimeout(() => animationFrame = window.requestAnimationFrame(updateAnimation), 100);
    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [animationLoaded]);

  const { data: races } = useQuery({
    queryKey: ["races"],
    queryFn: () => racesAPI.getRaces().then(res => res?.data?.races)
  });

  const startRace = (level) => {
    getRace(level);
  };

  return (
    <div className="dailyRacesBox" style={{display: (animationLoaded && races) ? "flex" : "none"}} onClick={(e) => e.stopPropagation()}>
      <div className="dailyRacesCloseButton" onClick={closeWindows}>
        <p>CLOSE</p>
      </div>
      <h2 className="dailyRacesHeader">BOB'S DAILY RACES</h2>
      <div className="dailyRacesContent">
        <div className="racesList">
          <p className="racesDescription">How well do you know the locations of projects on this site? Test your knowledge with three races to play every day!</p>
          {races && Object.entries(raceLevels).map(([level, number]) => {
            const race = races.find(race => race.level == number);
            return (
              <div
                className={`raceDiv ${race.userTime && "played"}`}
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
        <div className="racesAnimationContainer">
          <div className="racesAnimationCutoff">
            {(animationLoaded && races) && <img className="racesAnimation" src={bobAnimationFrames[currentFrame]} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyRaces;
