import '../stylesheets/DailyRaces.css';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, steps } from 'motion/react';
import racesAPI from '../api/RacesAPI';
import raceLevels from '../constants/raceLevels';
import spritesheet from '../assets/Bob Animation.png';

const framerate = 20;
const totalFrames = 52;

const animations = {
  initial: {y: [0, `-${36 * 400}px`], opacity: [0, 1]},
  wave: {y: [`-${36 * 400}px`, `-${43 * 400}px`]},
  blink: {y: [`-${44 * 400}px`, `-${51 * 400}px`]}
};

const transitions = {
  initial: {
    y: {
      delay: 0.75,
      duration: (1/framerate) * 36,
      ease: steps(36)
    },
    opacity: {
      duration: 0,
      delay: 0.75
    }
  },
  wave: {
    duration: (1/framerate) * 7,
    ease: steps(7)
  },
  blink: {
    duration: (1/framerate) * 7,
    ease: steps(7)
  }
};

const formatRaceTime = (time) => {
  if (time == null) return "--:--";

  const minutes = Math.floor(time / 60);
  const seconds = String(time % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const DailyRaces = (props) => {
  const { closeWindows, getRace } = props;
  const [spritesheetLoaded, setSpritesheetLoaded] = useState(false);
  const [animationState, setAnimationState] = useState("initial");
  const [animationCounter, setAnimationCounter] = useState(0);
  const [blinkTime, setBlinkTime] = useState(Math.floor(Math.random() * 7) + 7);

  useEffect(() => {
    const image = new window.Image();

    image.onload = () => {
      setSpritesheetLoaded(true);
    };
    setTimeout(() => image.src = spritesheet, 100);
  }, []);

  const { data: races } = useQuery({
    queryKey: ["races"],
    queryFn: () => racesAPI.getRaces().then(res => res?.data?.races)
  });

  const startRace = (level) => {
    getRace(level);
  };

  const switchAnimation = () => {
    if (animationCounter == blinkTime && animationState == "wave") {
      setAnimationState("blink");
      setBlinkTime(Math.floor(Math.random() * 7) + 7);
      setAnimationCounter(0);
    } else {
      setAnimationState("wave");
      setAnimationCounter(prev => prev + 1);
    }
  };

  return (
    <div className="dailyRacesBox" style={{display: spritesheetLoaded ? "flex" : "none"}} onClick={(e) => e.stopPropagation()}>
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
      <div className="racesAnimationContainer">
        {spritesheetLoaded && <motion.div
          className="racesAnimation"
          key={animationCounter}
          style={{backgroundImage: `url(${spritesheet})`, height: `calc(${totalFrames} * 400px)`}}
          animate={animations[animationState]}
          onAnimationComplete={switchAnimation}
          transition={transitions[animationState]}
        />}
      </div>
    </div>
  );
}

export default DailyRaces;
