import { motion } from 'motion/react';

const RegionName = (props) => {
  const { region, enterRegion } = props;

  return (
    <motion.div
      className="regionName"
      onClick={() => enterRegion(region)}
      initial={{opacity: 0, y: 10}}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: region.exit ? 0.2 : 0.4,
          ease: [0.3, 0, 0.3, 1],
          delay: region.exit ? 0.1 + Math.random() * 0.1 : 0.3 + Math.random() * 0.15,
        }
      }}
      exit={{opacity: 0, transition: {duration: 0.2, ease: [0.8, 0, 0.67, 1]}}}
      style={{
        position: "absolute",
        left: `${region.position[0]}%`,
        top: `${region.position[1]}%`,
      }}
    >
      <h2>{region.name}</h2>
      <div className={
        `regionTriangle${
        region.arrow[1] == "up" ? " regionTriangleTop" :
        region.arrow[1] == "down" ? " regionTriangleBottom" : ""}`} style={{
          left: `calc(${(region.arrow[0] / 100) * 100}% - 5px)`
        }}/>
    </motion.div>
  );
}

export default RegionName;