import { AnimatePresence, motion } from 'motion/react';
import factoryParts from "../constants/factoryParts.js";

const FactoryPart = (props) => {
  const {location, partIndex, onNecessaryReady, submitFactoryProgress} = props;

  const clicked = (e) => {
    e.stopPropagation();
    submitFactoryProgress();
  }

  return (
    <AnimatePresence>
      {factoryParts[partIndex] &&
        <motion.div
          className={`projectFactoryPart location${location}`}
          key={partIndex}
          exit={{opacity: 0, y: -10}}
          transition={{duration: 0.2, ease: "easeInOut"}}
        >
          <img
            src={factoryParts[partIndex]}
            alt={partIndex}
            onLoad={onNecessaryReady}
            onClick={clicked}
          />
        </motion.div>
      }
    </AnimatePresence>
  );
}

export default FactoryPart;