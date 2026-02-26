import '../stylesheets/UpdatesBox.css';
import { useRef, useState, useEffect } from 'react';
import WillIcon from '../assets/Will.png';
import UpdateBubble from './UpdateBubble.jsx';

const UpdatesBox = (props) => {
  const { updates, toggleReaction, isAdmin, full, toggleSeeMore, deleteUpdate } = props;
  const boxRef = useRef(null);
  const [expanded, setExpanded] = useState(full);
  const [screenChange, setScreenChange] = useState(0);

  const expandPreview = () => {
    setExpanded(true);
  }

  const receiveClick = (e) => {
    e.stopPropagation();
  }

  useEffect(() => {
    var i = 0;
    
    const resizeObserver = new ResizeObserver(() => {
      setScreenChange(i + 1);
      i = i + 1;
    });

    resizeObserver.observe(boxRef?.current);
  }, []);

  return (
    <div className={`updatesBoxAndButton${full ? " updatesBoxAndButtonFull" : ""}`} onClick={receiveClick}>
      <div ref={boxRef}
        onClick={expandPreview}
        className={`updatesBox
          ${full ? " updatesBoxFull" : ""}
          ${!expanded ? " updatesBoxCollapsed" : ""}
          ${(!expanded && boxRef.current?.scrollHeight > boxRef.current?.offsetHeight) ? " updatesBoxClickable" : ""}
        `}
      >
        <h2 className="updatesHeader">{full ? "WILL'S UPDATES" :"LATEST UPDATES"}</h2>
        {(!expanded && boxRef.current?.scrollHeight > boxRef.current?.offsetHeight) && (<div className="updatesBoxOverflow" />)}
        {(full ? updates : updates.slice(0, 1)).map((update) => (
          <div className={`updateRow${ full ? " updateRowFull" : " updateRowPreview"}`} key={update._id}>
            <div className="updateIcon">
              <img src={WillIcon} className="willIcon" />
              <div className="updateTriangle"></div>
            </div>
            <UpdateBubble full={full} update={update} isAdmin={isAdmin} toggleReaction={toggleReaction} deleteUpdate={deleteUpdate} />
          </div>
        ))}
      </div>
      {!full && (<div className="updatesButton" onClick={toggleSeeMore}>
        <p className="updatesButtonText">SEE MORE</p>
      </div>)}
      {full && (<div className="updatesButton updatesClose" onClick={toggleSeeMore}>
        <p className="updatesButtonText updatesCloseText">CLOSE</p>
      </div>)}
    </div>
  );
}

export default UpdatesBox;