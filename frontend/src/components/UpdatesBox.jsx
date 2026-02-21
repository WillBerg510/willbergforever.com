import '../stylesheets/UpdatesBox.css';

const UpdatesBox = (props) => {
  const { updates, reactions, toggleReaction } = props;

  return (
    <div className="updatesBox">
      <h2 className="updatesHeader">LATEST UPDATES</h2>
      {updates?.toReversed().map(update => (<div className="updateRow">
        <img src="/Will.png" className="willUpdateCircle" />
        <div className="updateBubble">
          <div className="updateTriangle"></div>
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
            <div className="updateReactionsBar">
              {Object.entries(reactions).map(([reactionName, reactionEmoji]) => 
                <button
                  className={`updateReaction${update.reacted[reactionName]
                    ? " updateReactionSelected"
                    : ""
                  }`}
                  onClick={() => toggleReaction(update, reactionName)}>
                  <p className="updateReactionEmoji">{reactionEmoji}</p>
                  <p className="updateReactionNumber">{(update.reactionNums?.[reactionName] || 0) + (update.reacted?.[reactionName] || 0)}</p>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>))}
    </div>
  );
}

export default UpdatesBox;