import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import updatesAPI from '../api/UpdatesAPI.js';
import WillIcon from '../assets/Will.png';
import reactions from "../constants/reactions.js";

const UpdateBubble = (props) => {
  const { allUpdatesOpen, update, full, isAdmin, userRefresh } = props;
  const [confirmDelete, setConfirmDelete] = useState();
  const [reactionStates, setReactionStates] = useState({});
  const [reactionNums, setReactionNums] = useState({});
  const [imageReady, setImageReady] = useState(false);
  const client = useQueryClient();

  const getReactionStates = () => {
    setReactionStates(Object.fromEntries(
      Object.keys(reactions).map(reaction => [reaction, update.reacted?.[reaction] || 0])
    ));
    setReactionNums(Object.fromEntries(
      Object.keys(reactions).map(reaction => [reaction, update.reactionNums?.[reaction] || 0])
    ));
  }
  
  useEffect(() => {
    getReactionStates();
  }, [allUpdatesOpen]);

  const { mutate: addReaction } = useMutation({
    mutationFn: (reaction) => updatesAPI.addReaction(update._id, reaction),
    retry: (count, error) => {
      if (error.response.status == 500 && count < 1) {
        userRefresh();
        return true;
      }
      return false;
    },
    onSuccess: () => client.invalidateQueries(["updates"]),
  });

  const { mutate: removeReaction } = useMutation({
    mutationFn: (reaction) => updatesAPI.removeReaction(update._id, reaction),
    retry: (count, error) => {
      if (error.response.status == 500 && count < 1) {
        userRefresh();
        return true;
      }
      return false;
    },
    onSuccess: () => client.invalidateQueries(["updates"]),
  });

  // Either add or remove reaction based on its current state, and appropriately modify the reaction's appearance on the page
  const toggleReaction = (reaction) => {
    const newReactionStates = reactionStates;
    newReactionStates[reaction] = !reactionStates[reaction];
    setReactionStates(newReactionStates);
    if (newReactionStates[reaction]) {
      addReaction(reaction);
    } else {
      removeReaction(reaction);
    }
  }

  // Delete update from its ID
  const { mutate: deleteUpdate } = useMutation({
    mutationFn: () => updatesAPI.deleteUpdate(update._id),
    onSuccess: () => {
      client.invalidateQueries(["updates"]);
    }
  });

  // When delete button is clicked, wait 2 seconds for a second confirmation click
  const deleteClicked = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => {
        setConfirmDelete(false);
      }, 2000);
    }
    else deleteUpdate();
  }

  const onImageReady = () => {
    setImageReady(true);
  }

  return (
    <div style={imageReady ? {display: "flex"} : {display: "none"}} className={`updateRow${ full ? " updateRowFull" : " updateRowPreview"}`}>
      <div className="updateIcon">
        <img src={WillIcon} className="willIcon" onLoad={onImageReady} />
        <div className="updateTriangle" />
      </div>
      <div className="updateBubble">
        <div>
          <p className="updateDate">{update.date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}</p>
          <p className="updateText">{update.text}</p>
          {Object.keys(reactionStates).length > 0 && <div className="updateReactionsBar">
            {Object.entries(reactions).map(([reactionName, reactionEmoji]) => 
              <button
                className={`updateLowerButton${reactionStates[reactionName]
                  ? " updateReactionSelected"
                  : ""
                }`}
                onClick={() => toggleReaction(reactionName)} key={update._id + reactionName}>
                <p className="updateReactionEmoji">{reactionEmoji}</p>
                <p className="updateReactionNumber">{reactionNums[reactionName] + reactionStates[reactionName]}</p>
              </button>
            )}
          </div>}
          {(isAdmin && full) && <button className="updateLowerButton updateDelete" onClick={deleteClicked}>
            {confirmDelete ? "Confirm" : "Delete"}
          </button>}
        </div>
      </div>
    </div>
  )
}

export default UpdateBubble;