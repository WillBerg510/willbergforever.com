import { useState, useEffect } from "react";
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from "react-router-dom";
import adminAPI from "../api/AdminAPI.js";
import updatesAPI from "../api/UpdatesAPI.js";
import projectsAPI from "../api/ProjectsAPI.js";
import "../stylesheets/AdminPanel.css";

const AdminPanel = () => {
  const [updateInput, setUpdateInput] = useState("");
  const [projectInput, setProjectInput] = useState({
    name: "",
    year: 2020,
    month: 1,
    day: 1,
    description: "",
    thumbnail: null,
    gallery: [],
    links: {},
    groups: [],
    region: "",
    icon: "",
    position: [-1, -1],
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    adminVerify();
  }, []);

  // Add new update and clear update input
  const { mutate: postUpdate, isSuccess: updatePosted } = useMutation({
    mutationFn: (updateInput != "") ? () => updatesAPI.postUpdate(updateInput) : () => {
      throw new Error;
    },
    onSuccess: () => setUpdateInput(""),
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
    onSuccess: (res) => {
      setIsAdmin(res.data);
      if (!res.data) {
        navigate("/login");
      }
    },
  });

  // Remove admin access token, remove admin refresh token, and revoke admin privileges
  const { mutate: signOut } = useMutation({
    mutationFn: adminAPI.signOut,
    onSuccess: () => setIsAdmin(false),
  });

  // On change of update textarea
  const changeUpdate = (e) => {
    setUpdateInput(e.target.value);
  }

  const onThumbnailUpload = (e) => {
    const file = e.target.files[0];
    setProjectInput({...projectInput, thumbnail: file});
    try {
      projectsAPI.postProject(file).then(res => console.log(res));
    } catch (err) {
      
    }
  }

  return (
    <>
      {isAdmin &&
        <div className="adminPanel">
          <div style={{display: "flex", gap: "10px", height: "36px", alignItems: "center"}}>
            <h2 style={{margin: "0"}}>Logged in as admin</h2>
            <button style={{margin: "0"}} onClick={signOut}>Sign Out</button>
          </div>
          <h1>ADMIN PANEL</h1>
          <div className="enterUpdate">
            <textarea onChange={changeUpdate} cols="50" rows="5" value={updateInput} />
            <button className="postUpdate" onClick={postUpdate}>Post an update</button>
            {updatePosted && <p>Update successfully posted</p>}
          </div>
          <div className="enterProject">
            <input name="thumbnail" type="file" accept="image/*" onChange={onThumbnailUpload} />
          </div>
        </div>
      }
    </>
  )
}

export default AdminPanel;