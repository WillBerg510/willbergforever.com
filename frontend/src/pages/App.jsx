import '../stylesheets/App.css'
import '../stylesheets/fonts.css'
import { useState, useEffect } from 'react';
import updatesAPI from "../api/UpdatesAPI.js";
import adminAPI from "../api/AdminAPI.js";
import userAPI from "../api/UserAPI.js";
import UpdatesBox from '../components/UpdatesBox.jsx';

function App() {
  const [update, setUpdate] = useState("");
  const [updates, setUpdates] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUpdatesOpen, setAllUpdatesOpen] = useState(false);
  const [userVerifyFailed, setUserVerifyFailed] = useState(false);

  // Verify whether the user's access tokens are valid upon page load, from which further setup actions are performed
  useEffect(() => {
    userVerify();
    adminVerify();
  }, []);

  // Add new update, clear update input, and get updated list
  const postUpdate = () => {
    if (update != "") {
      updatesAPI.postUpdate(localStorage.getItem("auth_token"), update).then(() => {
        getUpdates();
        setUpdate("");
      });
    }
  };

  // Get all updates
  const getUpdates = () => {
    updatesAPI.getUpdates(localStorage.getItem("user_auth_token")).then(res => {
      res.data.updates.forEach((update) => {
        update.date = new Date(update.date);
      });
      setUpdates(res.data.updates.toReversed());
    });
  };

  // Attempt renewal of admin tokens, and revoke admin privileges if unsuccessful
  const refresh = () => {
    adminAPI.refresh().then(res => {
      setIsAdmin(res.data.token != "n/a");
      if (res.data.token != "n/a") localStorage.setItem("auth_token", res.data.token);
    });
  }

  // Determine whether the user's admin access token is valid, and then attempt a refresh with the refresh token
  const adminVerify = () => {
    adminAPI.verify(localStorage.getItem("auth_token")).then(res => {
      if (res) {
        setIsAdmin(res.data.admin);
        refresh();
      }
    });
  }

  // Determine whether the user's standard access token is valid, and then attempt a refresh with the refresh token
  const userVerify = () => {
    userAPI.verify(localStorage.getItem("user_auth_token")).then(res => {
      if (!res) {
        setUserVerifyFailed(true);
      } else {
        if (res.data.valid) {
          getUpdates();
        }
        userRefresh();
      }
    });
  }

  // Acquire new user access token, and get all updates
  const getUser = () => {
    userAPI.getUser().then(res => {
      localStorage.setItem("user_auth_token", res.data.token);
      getUpdates();
    });
  }

  // Attempt renewal of user tokens, and get all updates if successful; otherwise, get a new user
  const userRefresh = () => {
    userAPI.refresh().then(res => {
      if (res.data.token != "n/a") {
        localStorage.setItem("user_auth_token", res.data.token);
        getUpdates();
      }
      else getUser();
    });
  }

  // Remove admin access token, remove admin refresh token, and revoke admin privileges
  const signOut = () => {
    localStorage.removeItem("auth_token");
    adminAPI.signOut().then(() => {
      setIsAdmin(false);
    });
  }

  // Either add or remove reaction based on its current state, and appropriately modify the reaction's appearance on the page
  const toggleReaction = (update, reaction) => {
    if (update.reacted[reaction]) {
      updatesAPI.removeReaction(localStorage.getItem("user_auth_token"), update._id, reaction);
    } else {
      updatesAPI.addReaction(localStorage.getItem("user_auth_token"), update._id, reaction);
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

  const toggleSeeMore = () => {
    if (allUpdatesOpen) {
      setAllUpdatesOpen(false);
      document.body.style.overflowY = "visible";
      document.body.style.overscrollBehavior = "auto";
    } else {
      setAllUpdatesOpen(true);
      document.body.style.overflowY = "hidden";
      document.body.style.overscrollBehavior = "none";
    }
  }

  // Delete update from its ID
  const deleteUpdate = (_id) => {
    updatesAPI.deleteUpdate(localStorage.getItem("auth_token"), _id).then(() => {
      getUpdates();
    });
  }

  // On change of update textarea
  const changeUpdate = (e) => {
    setUpdate(e.target.value);
  }

  return (
    <div id="app">
      {isAdmin &&
        <div style={{display: "flex", gap: "10px", height: "36px", alignItems: "center"}}>
          <h2 style={{margin: "0"}}>Logged in as admin</h2>
          <button style={{margin: "0"}} onClick={signOut}>Sign Out</button>
        </div>
      }
      <h1 className="mainHeading">WILL BERG</h1>
      <h2 className="mainSubtitle">AND THE WEBSITE ON THE INTERNET</h2>
      {isAdmin &&
        <div id="enterUpdate">
          <textarea onChange={changeUpdate} cols="50" rows="5" value={update} />
          <button id="postUpdate" onClick={postUpdate} style={{marginBottom: "30px"}}>Post an update</button>
        </div>
      }
      <UpdatesBox updates={updates} toggleReaction={toggleReaction} isAdmin={isAdmin} full={false} toggleSeeMore={toggleSeeMore} deleteUpdate={deleteUpdate} userVerifyFailed={userVerifyFailed} />
      {allUpdatesOpen && <div className="windowOnTop" onClick={toggleSeeMore}>
        <UpdatesBox updates={updates} toggleReaction={toggleReaction} isAdmin={isAdmin} full={true} toggleSeeMore={toggleSeeMore} deleteUpdate={deleteUpdate} userVerifyFailed={userVerifyFailed} />
      </div>}
    </div>
  )
}

export default App
