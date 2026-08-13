import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import updatesAPI from '../api/UpdatesAPI.js';
import Fanciest from "../assets/The Fanciest 2025 Small.png";
import { updateReactions } from "../constants/reactions.js";
import profilePics from "../constants/profilePics.js";

const parseMonthDay = (monthDay) => {
  const [month, day] = monthDay.split("/").map(Number);
  return new Date(2000, month - 1, day);
};

const getProfilePicForDate = (date) => {
  const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return profilePics.find((profilePic) => {
    if (profilePic.startDate.includes("Thanksgiving")) {
      const novemberFirst = new Date(date.getFullYear(), 10, 1);
      const daysUntilThursday = (4 - novemberFirst.getDay() + 7) % 7;
      const thanksgiving = new Date(date.getFullYear(), 10, 1 + daysUntilThursday + 21);
      const startDate = new Date(thanksgiving);
      startDate.setDate(startDate.getDate() - 6);
      const endDate = new Date(thanksgiving);
      endDate.setDate(endDate.getDate() + 1);
      return currentDate >= startDate && currentDate <= endDate;
    }

    const startDate = parseMonthDay(profilePic.startDate);
    const endDate = parseMonthDay(profilePic.endDate);
    const currentMonthDay = new Date(2000, currentDate.getMonth(), currentDate.getDate());

    return currentMonthDay >= startDate && currentMonthDay <= endDate;
  });
};

const UpdateBubble = (props) => {
  const { allUpdatesOpen, update, isAdmin, userRefresh } = props;
  const [confirmDelete, setConfirmDelete] = useState();
  const [reactionStates, setReactionStates] = useState({});
  const [reactionNums, setReactionNums] = useState({});
  const [imageReady, setImageReady] = useState(false);
  const client = useQueryClient();

  const getReactionStates = () => {
    setReactionStates(Object.fromEntries(
      Object.keys(updateReactions).map(reaction => [reaction, update.reacted?.[reaction] || 0])
    ));
    setReactionNums(Object.fromEntries(
      Object.keys(updateReactions).map(reaction => [reaction, update.reactionNums?.[reaction] || 0])
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
    <div style={imageReady ? {display: "flex"} : {display: "none"}} className={`updateRow`}>
      <div className="updateIcon">
        <img src={getProfilePicForDate(update.date)?.image || Fanciest} className="willIcon" onLoad={onImageReady} />
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
            {Object.entries(updateReactions).map(([reactionName, reactionEmoji]) => 
              <button
                className={`updateLowerButton${reactionStates[reactionName]
                  ? " reactionSelected"
                  : ""
                }`}
                onClick={() => toggleReaction(reactionName)} key={update._id + reactionName}>
                <p className="reactionEmoji">{reactionEmoji}</p>
                <p className="reactionNumber">{reactionNums[reactionName] + reactionStates[reactionName]}</p>
              </button>
            )}
          </div>}
          {isAdmin && <button className="updateLowerButton updateDelete" onClick={deleteClicked}>
            {confirmDelete ? "Confirm" : "Delete"}
          </button>}
        </div>
      </div>
    </div>
  )
}

export default UpdateBubble;