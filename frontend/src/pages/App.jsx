import '../stylesheets/App.css'
import '../stylesheets/fonts.css'
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import adminAPI from "../api/AdminAPI.js";
import userAPI from "../api/UserAPI.js";
import projectsAPI from '../api/ProjectsAPI.js';
import UpdatesBox from '../components/UpdatesBox.jsx';
import Island from '../components/Island.jsx';
import Project from '../components/Project.jsx';
import Player from '../components/Player.jsx';
import GroupMenu from '../components/GroupMenu.jsx';
import GroupList from '../components/GroupList.jsx';
import WillBergLogo from '../assets/WillBergLogo.png';
import regions from '../constants/regions.js';

const levels = {
  "Easy": 3,
  "Medium": 4,
  "Hard": 5,
};

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUpdatesOpen, setAllUpdatesOpen] = useState(false);
  const [openProject, setOpenProject] = useState(null);
  const [openPlayer, setOpenPlayer] = useState(null);
  const [racesData, setRacesData] = useState({});
  const [initialLoad, setInitialLoad] = useState(regions.map(region => region.holdsProjects && region.divisions.filter(division => division?.image)).flat().filter(item => item).length);
  const [initialLoadPeriod, setInitialLoadPeriod] = useState(true);
  const client = useQueryClient();
  const navigate = useNavigate();

  // Verify whether the user's access tokens are valid upon page load, from which further setup actions are performed
  useEffect(() => {
    userVerify();
    adminVerify();
    setTimeout(() => {setInitialLoadPeriod(false)}, 2000);
  }, []);

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

  const { data: groupProjects, isPending: gettingProjects, mutate: getGroupProjects } = useMutation({
    mutationFn: (group) => projectsAPI.getFromGroup(group)
      .then(res => res?.data?.projects?.map(project => ({
        ...project,
        date: new Date(project.date),
      }))),
  });

  const { mutate: getRace } = useMutation({
    mutationFn: (level) => projectsAPI.getRace(levels[level]),
    onSuccess: (res, level) => {
      const projects = res?.data?.projects;
      setRacesData(prev => ({...prev, [level]: projects}));
    },
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

  const toAdminPanel = () => {
    navigate("/admin");
  };

  const closeWindows = () => {
    setOpenProject(null);
    setOpenPlayer(null);
  };

  const onElementLoad = () => {
    setInitialLoad(prev => prev - 1);
  }

  return (
    <div id="app">
      {isAdmin &&
        <div style={{position: "absolute", right: 0, display: "flex", gap: "10px", height: "36px", alignItems: "center"}}>
          <p style={{margin: "0"}}>Logged in as admin</p>
          <button style={{margin: "0"}} onClick={toAdminPanel}>Admin Panel</button>
          <button style={{margin: "0"}} onClick={signOut}>Sign Out</button>
        </div>
      }
      <img className="mainHeading" src={WillBergLogo} />
      {/*<UpdatesBox allUpdatesOpen={allUpdatesOpen} isAdmin={isAdmin} full={false} toggleSeeMore={toggleSeeMore} userVerifyFailed={userVerifyFailed} userRefresh={userRefresh} />*/}
      {/*allUpdatesOpen && <div className="windowOnTop" onClick={toggleSeeMore}>
        <UpdatesBox allUpdatesOpen={allUpdatesOpen} isAdmin={isAdmin} full={true} toggleSeeMore={toggleSeeMore} userVerifyFailed={userVerifyFailed} userRefresh={userRefresh} />
      </div>*/}
      {/*<GroupMenu getGroupProjects={getGroupProjects} />*/}
      {groupProjects && <GroupList groupProjects={groupProjects} setOpenProject={setOpenProject} />}
      {(openProject || openPlayer) && <div className="windowOnTop" onClick={closeWindows}>
        {openProject && <Project project_id={openProject} key={openProject} closeWindows={closeWindows} userRefresh={userRefresh} isAdmin={isAdmin} setOpenPlayer={setOpenPlayer} />}
        {openPlayer && <Player project_id={openPlayer} closeWindows={closeWindows} setOpenProject={setOpenProject} />}
      </div>}
      {(initialLoad > 0 || initialLoadPeriod) && <>
        <Player project_id="69bb0642e7e1a811d30693ba" loader={true} />
        {regions.map(region => region.holdsProjects && region.divisions.map(division => <img src={division?.image} className="imageLoader" onLoad={onElementLoad}/>))}
      </>}
      {((!groupProjects || groupProjects.length == 0) && !gettingProjects) && <Island setOpenProject={setOpenProject} isAdmin={isAdmin} />}
      {/*<div style={{display: "flex", gap: "10px", zIndex: "4", justifyContent: "center", margin: "20px 0"}}>
        {Object.keys(levels).map(level => <button onClick={() => getRace(level)}>{level} Race</button>)}
      </div>*/}
      {/*<div style={{display: "flex", gap: "30px", zIndex: "4", justifyContent: "center", flexWrap: "wrap", margin: "20px 0"}}>
        {Object.keys(levels).map(level => 
          racesData[level] && (
          <div style={{border: "1px solid #ccc", padding: "10px", borderRadius: "5px"}}>
            <h3>{level} Race Projects</h3>
            <ul>
              {racesData[level].map((project) => (
                <li style={{textAlign: "left"}} key={project._id}>{project.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>*/}
    </div>
  )
}

export default App
