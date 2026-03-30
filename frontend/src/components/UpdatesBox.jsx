import '../stylesheets/UpdatesBox.css';
import { useRef, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import updatesAPI from '../api/UpdatesAPI.js';
import UpdateBubble from './UpdateBubble.jsx';

const UpdatesBox = (props) => {
  const { allUpdatesOpen, isAdmin, full, toggleSeeMore, userVerifyFailed, userRefresh } = props;
  const boxRef = useRef(null);
  const [expanded, setExpanded] = useState(full);
  const [showGradient, setShowGradient] = useState(false);

  // Get all updates
  const { data: updates, error: getUpdatesError, isLoading: isLoading } = useQuery({
    queryKey: ["updates"],
    queryFn: () => {
      return updatesAPI.getUpdates().then(res => {
        res.data.updates.forEach((update) => {
          update.date = new Date(update.date);
        });
        return res.data.updates.toReversed();
      });
    },
  });
  useEffect(() => {
    if (getUpdatesError?.response.status == 500) {
      userRefresh();
    }
  }, [getUpdatesError]);

  const expandPreview = () => {
    if (showGradient) setExpanded(true);
  }

  const receiveClick = (e) => {
    e.stopPropagation();
  }

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setShowGradient(boxRef.current?.scrollHeight > boxRef.current?.offsetHeight);
    });

    resizeObserver.observe(boxRef?.current);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setShowGradient(boxRef.current?.scrollHeight > boxRef.current?.offsetHeight);
    }, 200);
  }, [updates]);

  return (
    <div className={`updatesBoxAndButton${full ? " updatesBoxAndButtonFull" : ""}`} onClick={receiveClick}>
      <div ref={boxRef}
        onClick={expandPreview}
        className={`updatesBox
          ${full ? " updatesBoxFull" : ""}
          ${!expanded ? " updatesBoxCollapsed" : ""}
          ${(!expanded && showGradient) ? " updatesBoxClickable" : ""}
        `}
      >
        <h2 className="updatesHeader">{full ? "WILL'S UPDATES" : "LATEST UPDATES"}</h2>
        {(!expanded) && (<div className={`updatesBoxOverflow ${showGradient ? "" : "transparent"}`} />)}
        {userVerifyFailed && <p className="updatesBoxInfo">Unable to connect with backend server.</p>}
        {(isLoading && !userVerifyFailed) && <p className="updatesBoxInfo">Loading...</p>}
        {(full ? updates : updates?.slice(0, 1))?.map((update) => (
          <UpdateBubble key={update._id} allUpdatesOpen={allUpdatesOpen} full={full} update={update} isAdmin={isAdmin} userRefresh={userRefresh} />
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