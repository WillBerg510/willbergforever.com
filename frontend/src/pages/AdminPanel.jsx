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
  visible: true,
  specialReaction: "",
  region: "",
  icon: "",
  position: [0, 0],
  contentType: "",
  content: [],
  deleteGallery: [],
  deleteContent: [],
  contentNames: [],
};

const defaultProjectFilePreviews = {
  thumbnail: null,
  gallery: [],
  content: [],
};

const AdminPanel = () => {
  const [updateInput, setUpdateInput] = useState("");
  const [projectInput, setProjectInput] = useState(defaultProjectInput);
  const [projectFilePreviews, setProjectFilePreviews] = useState(defaultProjectFilePreviews);
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState();
  const projectThumbnailRef = useRef(null);
  const projectContentRef = useRef(null);
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
      const { name, date, description, thumbnail, gallery, links, groups, visible, specialReaction, region, icon, position, contentType, content, contentNames } = res.data.project;
      setProjectInput({
        name,
        date: new Date(date).toISOString().slice(0, 10),
        description,
        thumbnail,
        gallery,
        links,
        groups,
        visible: visible ?? true,
        specialReaction,
        region,
        icon,
        position,
        contentType,
        content,
        deleteGallery: [],
        deleteContent: [],
        contentNames,
      });
      setProjectFilePreviews({
        thumbnail,
        gallery,
        content,
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
      setProjectFilePreviews(defaultProjectFilePreviews);
      projectThumbnailRef.current.value = null;
      if (projectContentRef.current) projectContentRef.current.value = null;
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
    setProjectInput({...projectInput, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value});
  }

  const onThumbnailUpload = (e) => {
    let file = e.target.files[0];
    if (!file) file = null;
    setProjectInput({...projectInput, [e.target.name]: file});
    setProjectFilePreviews({...projectFilePreviews, thumbnail: file ? URL.createObjectURL(file) : null});
  }

  const onGalleryUpload = (e, index) => {
    let file = e.target.files[0];
    if (!file) file = null;
    setProjectInput(prev => {return {...prev, gallery: prev.gallery && prev.gallery.length > 0 ? prev.gallery.with(index, file) : [file]}});
    const galleryPreviews = projectFilePreviews.gallery ? [...projectFilePreviews.gallery] : [];
    galleryPreviews[index] = file ? URL.createObjectURL(file) : null;
    setProjectFilePreviews({...projectFilePreviews, gallery: galleryPreviews});
  }

  const onContentUpload = (e, index, contentPreviews) => {
    let file = e.target.files[0];
    if (!file) file = null;
    setProjectInput(prev => {return {...prev, content: prev.content && prev.content.length > 0 ? prev.content.with(index, file) : [file]}});
    setProjectFilePreviews(prev => {
      if (!contentPreviews) contentPreviews = prev.content ? [...prev.content] : [];
      contentPreviews[index] = file ? URL.createObjectURL(file) : null;
      return {...prev, content: contentPreviews};
    });
    return contentPreviews;
  }

  const onMultipleContentUpload = (e, index) => {
    if (e.target.files.length > 1) {
      let contentPreviews = projectFilePreviews.content ? [...projectFilePreviews.content] : [];
      Object.entries(e.target.files).forEach(([i, file]) => {
        if (i == 0) {
          contentPreviews = onContentUpload(e, index);
        } else {
          addContentItem(e);
          contentPreviews = onContentUpload({target: {files: [file]}}, index + parseInt(i), contentPreviews);
        }
      });
    } else {
      onContentUpload(e, index);
    }
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
    setProjectFilePreviews({...projectFilePreviews, gallery: [...projectFilePreviews.gallery, null]})
  }
  
  const deleteInputItem = (e, index) => {
    setProjectInput({...projectInput, [e.target.name]: projectInput[e.target.name].filter((v, i) => i != index)});
  }

  const deleteGalleryItem = (e, index) => {
    setProjectFilePreviews({...projectFilePreviews, gallery: projectFilePreviews.gallery.filter((v, i) => i != index)});
    setProjectInput({...projectInput, [e.target.name]: projectInput[e.target.name].filter((v, i) => i != index), deleteGallery: [...projectInput.deleteGallery, index]});
  }

  const addContentItem = (e) => {
    setProjectInput(prev => prev.content ? {...prev, content: [...prev.content, null], contentNames: [...prev.contentNames, ""]} : {...prev, content: [null], contentNames: [""]});
    setProjectFilePreviews(prev => prev.content ? {...prev, content: [...prev.content, null]} : {...prev, content: [null]});
  }

  const deleteContentItem = (e, index) => {
    setProjectFilePreviews({...projectFilePreviews, content: projectFilePreviews.content.filter((v, i) => i != index)});
    setProjectInput({...projectInput, content: projectInput.content.filter((v, i) => i != index), contentNames: projectInput.contentNames.filter((v, i) => i != index), deleteContent: [...projectInput.deleteContent, index]});
    if (projectInput.contentType != "gallery") projectContentRef.current.value = null;
  }

  const onContentTypeChange = (e) => {
    if (e.target.value == "gallery") {
      setProjectInput({...projectInput, contentType: e.target.value, contentNames: [""]});
    } else if (e.target.value == "audio") {
      const content = [...(projectInput.content ?? [])];
      if (content[0] === undefined) content[0] = null;
      if (content[1] === undefined) content[1] = null;
      setProjectInput({...projectInput, contentType: e.target.value, content});
    } else if (e.target.value == "musicVideo") {
      const content = [...(projectInput.content ?? [])];
      if (content[0] === undefined) content[0] = null;
      if (content[1] === undefined) content[1] = null;
      if (content[2] === undefined) content[2] = null;
      setProjectInput({...projectInput, contentType: e.target.value, content});
    } else {
      setProjectInput({...projectInput, contentType: e.target.value});
    }
  }

  const onContentNameChange = (e, index) => {
    setProjectInput({...projectInput, contentNames: projectInput.contentNames.with(index, e.target.value)});
  }

  const onPositionChange = (e) => {
    setProjectInput({...projectInput, position: projectInput.position.with(e.target.name == "positionY", e.target.valueAsNumber)});
  }

  const returnHome = () => {
    navigate("/");
  }

  const { mutate: deleteProject, isError: projectDeleteError } = useMutation({
    mutationFn: () => projectsAPI.deleteProject(editProject),
    onSuccess: returnHome,
  });

  const deleteClicked = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => {
        setConfirmDelete(false);
      }, 2000);
    }
    else deleteProject();
  };

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
            <textarea name="description" onChange={onProjectChange} value={projectInput.description} cols="50" />
            <p>Thumbnail</p>
            {projectFilePreviews.thumbnail && <img height="100" src={projectFilePreviews.thumbnail} />}<p />
            <label htmlFor="thumbnail" className="fileUpload">Upload Image</label>
            <input name="thumbnail" id="thumbnail" type="file" accept="image/*" ref={projectThumbnailRef} onChange={onThumbnailUpload} />
            <p>Gallery Images</p>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
              {projectInput.gallery.map((file, index) => 
                <div key={`gallery${index}`}>
                  {projectFilePreviews.gallery[index] && <img height="100" src={projectFilePreviews.gallery[index]} />}<p />
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
                  <select name="groups" style={{width: "140px"}} value={projectInput.groups[index]} type="text" onChange={e => onArrayProjectChange(e, index)}>
                    <option value=""></option>
                    {Object.entries(projectGroups).filter(([key, value]) => key == projectInput.groups[index] || !projectInput.groups.includes(key)).map(([key, value]) =>
                      <option key={key} value={key} >{value.name}</option>
                    )}
                  </select><p />
                  <button name="groups" onClick={(e) => deleteInputItem(e, index)}>Delete</button>
                </div>
              )}
              <button onClick={addInputItem} style={{width: "50px", height: "50px", fontSize: "16px"}} name="groups">Add</button>
            </div>
            <p>Special Reaction</p>
            <input name="specialReaction" style={{width: "30px", textAlign: "center"}} type="text" value={projectInput.specialReaction} onChange={onProjectChange} />
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
            <p>Content Type</p>
            <select name="contentType" type="text" onChange={onContentTypeChange} value={projectInput.contentType}>
              <option value=""></option>
              <option value="audio">Audio</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="musicVideo">Music Video</option>
              <option value="gallery">Gallery</option>
            </select>
            <p>Content</p>
            {projectInput.contentType == "audio" ? <>
              {projectFilePreviews.content[0] && <audio controls src={projectFilePreviews.content[0]} />}
              {projectFilePreviews.content[0] && <button name="content" onClick={(e) => deleteContentItem(e, 0)}>Delete</button>}
              <p />
              <label htmlFor="content0" className="fileUpload">Upload Audio</label>
              <input name="content" id="content0" type="file" accept="audio/*" ref={projectContentRef} onChange={(e) => onContentUpload(e, 0)} />
              <p />
              {projectFilePreviews.content[1] && <img height="200" src={projectFilePreviews.content[1]} />}
              {projectFilePreviews.content[1] && <button name="content" onClick={(e) => deleteContentItem(e, 1)}>Delete</button>}
              <p />
              <label htmlFor="content1" className="fileUpload">Upload Artwork</label>
              <input name="content" id="content1" type="file" accept="image/*" onChange={(e) => onContentUpload(e, 1)} />
            </> : projectInput.contentType == "musicVideo" ? <>
              {projectFilePreviews.content[0] && <video controls height="200" src={projectFilePreviews.content[0]} />}
              {projectFilePreviews.content?.length > 0 && <button name="content" onClick={(e) => deleteContentItem(e, 0)}>Delete</button>}
              <p />
              <label htmlFor="content" className="fileUpload">Upload Video</label>
              <input name="content" id="content" type="file" ref={projectContentRef} onChange={(e) => onContentUpload(e, 0)} />
              <p />
              {projectFilePreviews.content[1] && <audio controls src={projectFilePreviews.content[1]} />}
              {projectFilePreviews.content[1] && <button name="content" onClick={(e) => deleteContentItem(e, 1)}>Delete</button>}
              <p />
              <label htmlFor="content0" className="fileUpload">Upload Audio</label>
              <input name="content" id="content0" type="file" accept="audio/*" ref={projectContentRef} onChange={(e) => onContentUpload(e, 1)} />
              <p />
              {projectFilePreviews.content[2] && <img height="200" src={projectFilePreviews.content[2]} />}
              {projectFilePreviews.content[2] && <button name="content" onClick={(e) => deleteContentItem(e, 2)}>Delete</button>}
              <p />
              <label htmlFor="content1" className="fileUpload">Upload Artwork</label>
              <input name="content" id="content1" type="file" accept="image/*" onChange={(e) => onContentUpload(e, 2)} />
            </> : projectInput.contentType != "gallery" ? <>
              {projectFilePreviews.content?.length > 0 && (
                projectInput.contentType == "image" ? <img height="200" src={projectFilePreviews.content[0]} />
                : projectInput.contentType == "video" ? <video controls height="200" src={projectFilePreviews.content[0]} />
                : null
              )}
              {projectFilePreviews.content?.length > 0 && <button name="content" onClick={(e) => deleteContentItem(e, 0)}>Delete</button>}
              <p />
              <label htmlFor="content" className="fileUpload">Upload Content</label>
              <input name="content" id="content" type="file" ref={projectContentRef} onChange={(e) => onContentUpload(e, 0)} />
            </> : <div style={{display: "grid", gridTemplateColumns: `repeat(${Math.min(12, projectInput.content?.length + 1 || 1)}, 1fr)`, justifyContent: "center", alignItems: "center"}}>
              {projectInput.content?.map((file, index) => 
                <div key={`content${index}`}>
                  {projectFilePreviews.content[index] && <img height="100" src={projectFilePreviews.content[index]} />}<p />
                  <input size="12" name="contentNames" id={`contentNames${index}`} type="text" value={projectInput.contentNames[index]} onChange={(e) => onContentNameChange(e, index)} />
                  <label htmlFor={`content${index}`} className="fileUpload">Upload Image</label>
                  <input name="content" id={`content${index}`} type="file" accept="image/*" multiple onChange={(e) => onMultipleContentUpload(e, index)} /><p />
                  <button name="content" onClick={(e) => deleteContentItem(e, index)}>Delete</button>
                </div>
              )}
              <button onClick={addContentItem} style={{width: "50px", height: "50px", fontSize: "16px"}} name="content">Add</button>
            </div>
            }
            <p />
            <label htmlFor="visible" style={{display: "inline-flex", gap: "8px", alignItems: "center"}}>
              <input name="visible" id="visible" type="checkbox" checked={projectInput.visible} onChange={onProjectChange} />
              Visible
            </label>
            <p />
            {(projectPostLoading || projectEditLoading) && <p>Uploading project...</p>}
            {(projectPosted || projectEdited) && <p>Project successfully uploaded</p>}
            {(projectPostError || projectEditError) && <p>Error uploading project</p>}
            {(projectDeleteError) && <p>Error deleting project</p>}
            <button onClick={editProject ? submitEdit : submitProject}>{editProject ? "Edit" : "Submit"}</button><p />
            {editProject && <button onClick={deleteClicked}>{confirmDelete ? "Confirm" : "Delete Project"}</button>}
          </div>
        </div>
      }
    </>
  )
}

export default AdminPanel;