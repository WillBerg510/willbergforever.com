import '../stylesheets/Island.css';
import RegionName from './RegionName.jsx';
import { useState, useEffect, useRef } from 'react';
import regions from '../constants/regions.js';

const Island = (props) => {
  const [fullX, setFullX] = useState(0);
  const [fullY, setFullY] = useState(0);
  const islandRef = useRef(null);
  
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      setFullX(entries[0].contentRect.width);
      setFullY(entries[0].contentRect.height);
    });

    resizeObserver.observe(islandRef?.current);
  }, []);

  return (
    <div className="island" ref={islandRef}>
      {regions.map(region => <RegionName region={region} fullX={fullX} fullY={fullY}/>)}
    </div>
  );
}

export default Island;