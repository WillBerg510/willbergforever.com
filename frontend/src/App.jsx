import './App.css'
import { useState, useEffect } from 'react';
import { BACKEND } from "./config.js";

function App() {
  const [update, setUpdate] = useState("");
  const [updates, setUpdates] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const reactions = {
    "heart": "❤️",
    "fire": "🔥",
    "surprise": "😯"
  };

  const postUpdate = () => {
    if (update != "") {
      fetch(`${BACKEND}/updates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          text: update,
          date: Date.now(),
        }),
      }).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error status: ${res.status}`);
        }
        getUpdates();
        setUpdate("");
        return res.json();
      }).catch(error => {
        alert(error);
      });
    }
  };

  const getUpdates = () => {
    fetch(`${BACKEND}/updates`).then(res => {
      if (!res.ok) {
        throw new Error(`Response status ${res.status}`);
      }
      return res.json();
    }).then(data => {
      data.updates.forEach((update) => {
        update.date = new Date(update.date);
        update.reacted = {
          "heart": false,
          "fire": false,
          "surprise": false,
        };
      });
      setUpdates(data.updates);
    }).catch(error => {
      alert(error);
    });
  };

  const verify = () => {
    fetch(`${BACKEND}/login/verify`, {
      method: "HEAD",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
      },
    }).then(res => {
      if (!res.ok) {
        throw new Error(`Response status ${res.status}`);
      }
      setIsAdmin(true);
    }).catch(error => {
      setIsAdmin(false);
    })
  }

  useEffect(() => {
    getUpdates();
    verify();
  }, []);

  const changeUpdate = (e) => {
    setUpdate(e.target.value);
  }

  const signOut = () => {
    localStorage.removeItem("auth_token");
    getUpdates();
    verify();
  }

  const toggleReaction = (update, reaction) => {
    if (update.reacted[reaction]) {
      fetch(`${BACKEND}/updates/unreact/${update._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reaction: reaction,
        })
      }).then(res => {
        if (!res.ok) {
          throw new Error(`Response status ${res.status}`);
        }
      }).catch(error => {
        alert(error);
      });
    } else {
      fetch(`${BACKEND}/updates/react/${update._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reaction: reaction,
        })
      }).then(res => {
        if (!res.ok) {
          throw new Error(`Response status ${res.status}`);
        }
      }).catch(error => {
        alert(error);
      });
    }
    setUpdates(updates.map(up => {
        if (update._id == up._id) {
          var newReacted = up.reacted;
          newReacted[reaction] = !up.reacted[reaction];
          return {...up, reacted: newReacted}
        }
        else return up;
      }));
  }

  const deleteUpdate = (_id) => {
    fetch(`${BACKEND}/updates/one/${_id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error(`Response status ${res.status}`);
      }
    }).then(() => {
      getUpdates();
    }).catch(error => {
      alert(error);
    });
  }

  const clearUpdates = () => {
    fetch(`${BACKEND}/updates/clear`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error(`Response status ${res.status}`);
      }
    }).then(() => {
      getUpdates();
    }).catch(error => {
      alert(error);
    });
  }

  return (
    <div id="app">
      {isAdmin &&
        <div>
          <h2>Logged in as admin</h2>
          <button onClick={signOut}>Sign Out</button>
        </div>
      }
      <h1>WELCOME TO THE WILL BERG WEBSITE</h1>
      <h2>THE PLACE TO BE</h2>
      <h3>Glad you could make it</h3>
      {isAdmin &&
        <div id="enterUpdate">
          <textarea onChange={changeUpdate} cols="50" rows="5" value={update} />
          <button id="postUpdate" onClick={postUpdate}>Post an update</button>
        </div>
      }
      {updates.toReversed().map((update, i) =>
        <div index={i} className="update">
          <h2 className="updateText">{update.text}</h2>
          <p className="updateDate">{update.date.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}</p>
          {isAdmin &&
            <button className="deleteUpdate" onClick={() => deleteUpdate(update._id)}>Delete</button>
          }
          <div className="reactions">
            {Object.entries(reactions).map(([reactionName, reactionEmoji]) => 
              <button
                className="reaction"
                style={{
                  backgroundColor: update.reacted[reactionName] ? "lightgreen" : "lightgrey",
                }}
                onClick={() => toggleReaction(update, reactionName)}>
                {reactionEmoji} {(update.reactions?.[reactionName] | 0) + update.reacted?.[reactionName]}
              </button>
            )}
          </div>
        </div>
      )}
      {isAdmin &&
        <button onClick={clearUpdates}>Delete updates</button>
      }
    </div>
  )
}

export default App
