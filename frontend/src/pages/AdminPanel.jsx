import { useState, useEffect, useRef } from "react";
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from "react-router-dom";
import adminAPI from "../api/AdminAPI.js";
import updatesAPI from "../api/UpdatesAPI.js";
import projectsAPI from "../api/ProjectsAPI.js";
import projectGroups from "../constants/projectGroups.js";
import regions from "../constants/regions.js";
import "../stylesheets/AdminPanel.css";

const defaultProjectInput = {
  name: "",
  date: "",
  description: "",
  thumbnail: null,
  gallery: [],
  links: {},
  groups: [],
  specialReaction: "",
  region: "",
  icon: "",
  position: [0, 0],
  deleteGallery: [],
};

const defaultProjectImagePreviews = {
  thumbnail: null,
  gallery: [],
};

const AdminPanel = () => {
  const [updateInput, setUpdateInput] = useState("");
  const [projectInput, setProjectInput] = useState(defaultProjectInput);
  const [projectImagePreviews, setProjectImagePreviews] = useState(defaultProjectImagePreviews);
  const [isAdmin, setIsAdmin] = useState(false);
  const projectThumbnailRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editProject = searchParams.get("editProject");

  useEffect(() => {
    adminVerify();
    if (editProject) getProjectToEdit();
  }, []);

  const { mutate: getProjectToEdit } = useMutation({
    mutationFn: () => projectsAPI.getProjectInfo(editProject),
    onSuccess: async (res) => {
      const { name, date, description, thumbnail, gallery, links, groups, specialReaction, region, icon, position } = res.data.project;
      setProjectInput({
        name,
        date: new Date(date).toISOString().slice(0, 10),
        description,
        thumbnail,
        gallery,
        links,
        groups,
        specialReaction,
        region,
        icon,
        position,
        deleteGallery: [],
      });
      setProjectImagePreviews({
        thumbnail,
        gallery,
      });
    },
  });

  const { mutate: submitEdit, isSuccess: projectEdited, isPending: projectEditLoading, isError: projectEditError } = useMutation({
    mutationFn: () => projectsAPI.editProject(editProject, projectInput),
    onSuccess: () => setTimeout(getProjectToEdit, 200),
  });

  const { mutate: submitProject, isSuccess: projectPosted, isPending: projectPostLoading, isError: projectPostError } = useMutation({
    mutationFn: () => projectsAPI.postProject(projectInput),
    onSuccess: () => {
      setProjectInput(defaultProjectInput);
      setProjectImagePreviews(defaultProjectImagePreviews);
      projectThumbnailRef.current.value = null;
    },
  });

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

  const onProjectChange = (e) => {
    setProjectInput({...projectInput, [e.target.name]: e.target.value});
  }

  const onThumbnailUpload = (e) => {
    const file = e.target.files[0];
    setProjectInput({...projectInput, [e.target.name]: file});
    setProjectImagePreviews({...projectImagePreviews, thumbnail: URL.createObjectURL(file)});
  }

  const onGalleryUpload = (e, index) => {
    const file = e.target.files[0];
    setProjectInput({...projectInput, gallery: projectInput.gallery.with(index, file)});
    const galleryPreviews = projectImagePreviews.gallery;
    galleryPreviews[index] = URL.createObjectURL(file);
    setProjectImagePreviews({...projectImagePreviews, gallery: galleryPreviews});
  }

  const onArrayProjectChange = (e, index) => {
    const projectArray = projectInput[e.target.name];
    projectArray[index] = e.target.value;
    setProjectInput({...projectInput, [e.target.name]: projectArray});
  }

  const onLinkChange = (e) => {
    setProjectInput({...projectInput, links: {...projectInput.links, [e.target.name]: e.target.value}});
  }

  const addInputItem = (e) => {
    setProjectInput({...projectInput, [e.target.name]: [...projectInput[e.target.name], ""]});
  }

  const addGalleryItem = (e) => {
    setProjectInput({...projectInput, [e.target.name]: [...projectInput[e.target.name], null]});
    setProjectImagePreviews({...projectImagePreviews, gallery: [...projectImagePreviews.gallery, null]})
  }
  
  const deleteInputItem = (e, index) => {
    setProjectInput({...projectInput, [e.target.name]: projectInput[e.target.name].filter((v, i) => i != index)});
  }

  const deleteGalleryItem = (e, index) => {
    setProjectImagePreviews({...projectImagePreviews, gallery: projectImagePreviews.gallery.filter((v, i) => i != index)});
    setProjectInput({...projectInput, [e.target.name]: projectInput[e.target.name].filter((v, i) => i != index), deleteGallery: [...projectInput.deleteGallery, index]});
  }

  const onPositionChange = (e) => {
    setProjectInput({...projectInput, position: projectInput.position.with(e.target.name == "positionY", e.target.valueAsNumber)});
  }

  const returnHome = () => {
    navigate("/");
  }

  return (
    <>
      <button onClick={returnHome}>Return to Home Page</button>
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
          <div className="enterProject" style={{height: "500px", overflowY: "scroll"}}>
            <h2>{editProject ? "Update project" : "Upload new project"}</h2>
            <p>Name</p>
            <input name="name" type="text" value={projectInput.name} onChange={onProjectChange} />
            <p>Date</p>
            <input name="date" type="date" value={projectInput.date} onChange={onProjectChange} />
            <p>Description</p>
            <textarea name="description" onChange={onProjectChange} value={projectInput.description} cols="50" rows="5" />
            <p>Thumbnail</p>
            {projectImagePreviews.thumbnail && <img height="100" src={projectImagePreviews.thumbnail} />}<p />
            <label htmlFor="thumbnail" className="fileUpload">Upload Image</label>
            <input name="thumbnail" id="thumbnail" type="file" accept="image/*" ref={projectThumbnailRef} onChange={onThumbnailUpload} />
            <p>Gallery Images</p>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
              {projectInput.gallery.map((file, index) => 
                <div key={`gallery${index}`}>
                  {projectImagePreviews.gallery[index] && <img height="100" src={projectImagePreviews.gallery[index]} />}<p />
                  <label htmlFor={`gallery${index}`} className="fileUpload">Upload Image</label>
                  <input name="gallery" id={`gallery${index}`} type="file" accept="image/*" onChange={(e) => onGalleryUpload(e, index)} /><p />
                  <button name="gallery" onClick={(e) => deleteGalleryItem(e, index)}>Delete</button>
                </div>
              )}
              <button onClick={addGalleryItem} style={{width: "50px", height: "50px", fontSize: "16px"}} name="gallery">Add</button>
            </div>
            <p>Links</p>
            <label htmlFor="youtube">YouTube  </label>
            <input name="youtube" id="youtube" type="text" onChange={onLinkChange} value={projectInput.links?.youtube ? projectInput.links.youtube : ""} /><p />
            <label htmlFor="spotify">Spotify  </label>
            <input name="spotify" id="spotify" type="text" onChange={onLinkChange} value={projectInput.links?.spotify ? projectInput.links.spotify : ""} /><p />
            <label htmlFor="generalLink">General Link  </label>
            <input name="link" id="generalLink" type="text" onChange={onLinkChange} value={projectInput.links?.link ? projectInput.links.link : ""} /><p />
            <p>Groups</p>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
              {projectInput.groups.map((group, index) =>
                <div key={`group${index}`}>
                  <select name="groups" value={projectInput.groups[index]} type="text" onChange={e => onArrayProjectChange(e, index)}>
                    <option value=""></option>
                    {Object.entries(projectGroups).map(([key, value]) =>
                      <option value={key} >{value}</option>
                    )}
                  </select><p />
                  <button name="groups" onClick={(e) => deleteInputItem(e, index)}>Delete</button>
                </div>
              )}
              <button onClick={addInputItem} style={{width: "50px", height: "50px", fontSize: "16px"}} name="groups">Add</button>
            </div>
            <p>Special Reaction</p>
            <input name="specialReaction" style={{width: "30px", textAlign: "center"}} maxLength="2" type="text" value={projectInput.specialReaction} onChange={onProjectChange} />
            <p>Region</p>
            <select name="region" type="text" onChange={onProjectChange} value={projectInput.region}>
              <option value=""></option>
              {regions.filter(region => region.holdsProjects).map(region =>
                <>
                  {region.divisions
                    ? region.divisions.map(division =>
                      <option key={`${region.code}${division.code}`} value={`${region.code}-${division.code}`}>{region.name} - {division.name}</option>
                    ) : <option key={region.code} value={region.code}>{region.name}</option>
                  }
                </>
              )}
            </select>
            <p>Icon</p>
            <select name="icon" type="text" onChange={onProjectChange} value={projectInput.icon}>
              <option value=""></option>
              <option value="music">Music</option>
              <option value="art">Art</option>
              <option value="video">Video</option>
              <option value="interactive">Interactive</option>
              <option value="photos">Photos</option>
            </select>
            <p>Position</p>
            <input name="positionX" min="0" style={{width: "50px"}} type="number" onChange={onPositionChange} value={projectInput.position[0]} />
            <input name="positionY" min="0" style={{width: "50px"}} type="number" onChange={onPositionChange} value={projectInput.position[1]} />
            <p />
            {(projectPostLoading || projectEditLoading) && <p>Uploading project...</p>}
            {(projectPosted || (projectEdited && !projectPostError && !projectPostLoading)) && <p>Project successfully uploaded</p>}
            {(projectPostError || projectEditError) && <p>Error uploading project</p>}
            <button onClick={editProject ? submitEdit : submitProject}>{editProject ? "Edit" : "Submit"}</button>
          </div>
        </div>
      }
    </>
  )
}

export default AdminPanel;