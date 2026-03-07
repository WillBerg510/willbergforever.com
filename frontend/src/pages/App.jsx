import '../stylesheets/App.css'
import '../stylesheets/fonts.css'
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import updatesAPI from "../api/UpdatesAPI.js";
import adminAPI from "../api/AdminAPI.js";
import userAPI from "../api/UserAPI.js";
import UpdatesBox from '../components/UpdatesBox.jsx';

function App() {
  const [update, setUpdate] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUpdatesOpen, setAllUpdatesOpen] = useState(false);
  const client = useQueryClient();

  // Verify whether the user's access tokens are valid upon page load, from which further setup actions are performed
  useEffect(() => {
    userVerify();
    adminVerify();
  }, []);

  // Add new update and clear update input
  const postUpdate = useMutation({
    mutationFn: () => (update != "") ? updatesAPI.postUpdate(update) : null,
    onSuccess: () => {
      client.invalidateQueries(["updates"]);
      setUpdate("");
    }
  });

  // Determine whether the user's admin access token is valid, and then attempt a refresh with the refresh token
  const { mutate: adminVerify } = useMutation({
    mutationFn: () => adminAPI.verify(),
    onSuccess: (res) => {
      setIsAdmin(res.data);
      adminRefresh();
    },
  });

  // Attempt renewal of admin tokens, and revoke admin privileges if unsuccessful
  const { mutate: adminRefresh } = useMutation({
    mutationFn: () => adminAPI.refresh(),
    onSuccess: (res) => setIsAdmin(res.data),
  });

  // Determine whether the user's standard access token is valid, and then attempt a refresh with the refresh token
  const { mutate: userVerify, isError: userVerifyFailed } = useMutation({
    mutationFn: () => userAPI.verify(),
    onSuccess: (res) => {
      if (res.data) {
        client.invalidateQueries(["updates"]);
      }
      userRefresh();
    },
  });

  // Attempt renewal of user tokens, and get all updates if successful; otherwise, get a new user
  const { mutate: userRefresh } = useMutation({
    mutationFn: () => userAPI.refresh(),
    onSuccess: (res) => {
      if (res.data) {
        client.invalidateQueries(["updates"]);
      }
      else getUser();
    }
  });

  // Acquire new user access token, and get all updates
  const { mutate: getUser } = useMutation({
    mutationFn: () => userAPI.getUser(),
    onSuccess: () => {
      client.invalidateQueries(["updates"]);
    },
  });

  // Remove admin access token, remove admin refresh token, and revoke admin privileges
  const { mutate: signOut } = useMutation({
    mutationFn: adminAPI.signOut,
    onSuccess: () => setIsAdmin(false),
  });

  const toggleSeeMore = async () => {
    client.invalidateQueries(["updates"]);
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
          <button id="postUpdate" onClick={postUpdate.mutate} style={{marginBottom: "30px"}}>Post an update</button>
        </div>
      }
      <UpdatesBox allUpdatesOpen={allUpdatesOpen} isAdmin={isAdmin} full={false} toggleSeeMore={toggleSeeMore} userVerifyFailed={userVerifyFailed} userRefresh={userRefresh} />
      {allUpdatesOpen && <div className="windowOnTop" onClick={toggleSeeMore}>
        <UpdatesBox allUpdatesOpen={allUpdatesOpen} isAdmin={isAdmin} full={true} toggleSeeMore={toggleSeeMore} userVerifyFailed={userVerifyFailed} userRefresh={userRefresh} />
      </div>}
    </div>
  )
}

export default App
