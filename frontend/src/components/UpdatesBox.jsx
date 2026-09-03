import '../stylesheets/UpdatesBox.css';
import { useRef, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import updatesAPI from '../api/UpdatesAPI.js';
import UpdateBubble from './UpdateBubble.jsx';

const UpdatesBox = (props) => {
  const { allUpdatesOpen, isAdmin, full, toggleSeeMore, userVerifyFailed, userRefresh, closeWindows } = props;
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
    if (getUpdatesError?.response?.status == 500) {
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
    <div
      ref={boxRef}
      className={`updatesBox
        ${!expanded ? " updatesBoxCollapsed" : ""}
        ${(!expanded && showGradient) ? " updatesBoxClickable" : ""}
      `}
      onClick={receiveClick}
    >
      <div className="updatesCloseButton" onClick={closeWindows}>
        <p>CLOSE</p>
      </div>
      <h2 className="updatesHeader">LATEST UPDATES</h2>
      {(!expanded) && (<div className={`updatesBoxOverflow ${showGradient ? "" : "transparent"}`} />)}
      {userVerifyFailed && <p className="updatesBoxInfo">Unable to connect with backend server.</p>}
      {(isLoading && !userVerifyFailed) && <p className="updatesBoxInfo">Loading...</p>}
      <div className="updatesList">
        {updates?.map((update) => (
          <UpdateBubble key={update._id} allUpdatesOpen={allUpdatesOpen} update={update} isAdmin={isAdmin} userRefresh={userRefresh} />
        ))}
      </div>
    </div>
  );
}

export default UpdatesBox;