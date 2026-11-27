import { useState, useEffect, useRef } from "react";
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from "react-router-dom";
import adminAPI from "../api/AdminAPI.js";
import updatesAPI from "../api/UpdatesAPI.js";
import projectsAPI from "../api/ProjectsAPI.js";
import factoryAPI from "../api/FactoryAPI.js";
import projectGroups from "../constants/projectGroups.js";
import factoryParts from "../constants/factoryParts.js";
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

const defaultFactoryInput = {
  name: "",
  contentTitle: "",
  projects: [""],
  parts: [""],
  locations: [""],
  active: true,
  contentType: "",
  content: [],
  contentNames: [],
};

const defaultFactoryFilePreviews = {
  content: [],
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editProject = searchParams.get("editProject");
  const editFactoryEvent = searchParams.get("editFactoryEvent");
  const [updateInput, setUpdateInput] = useState("");
  const [projectInput, setProjectInput] = useState(defaultProjectInput);
  const [projectFilePreviews, setProjectFilePreviews] = useState(defaultProjectFilePreviews);
  const [factoryInput, setFactoryInput] = useState(defaultFactoryInput);
  const [factoryFilePreviews, setFactoryFilePreviews] = useState(defaultFactoryFilePreviews);
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState();
  const projectThumbnailRef = useRef(null);
  const projectContentRef = useRef(null);
  const factoryContentRef = useRef(null);
  const [postingMode, setPostingMode] = useState(editProject ? "project" : editFactoryEvent ? "factory" : "update");

  useEffect(() => {
    adminVerify();
    if (editProject) getProjectToEdit();
    if (editFactoryEvent) getFactoryEventToEdit();
  }, []);

  const { mutate: getFactoryEventToEdit } = useMutation({
    mutationFn: () => factoryAPI.getFactoryEventForEdit(),
    onSuccess: (res) => {
      const event = res.data.factoryEvent;
      if (!event || event._id != editFactoryEvent) return;
      setFactoryInput({
        name: event.name,
        contentTitle: event.contentTitle || "",
        projects: event.projects,
        parts: event.projects.map((_, index) => event.parts?.[index] || ""),
        locations: event.projects.map((_, index) => event.locations?.[index] ?? ""),
        active: event.active,
        contentType: event.contentType,
        content: event.content,
        contentNames: event.contentNames || [],
      });
      setFactoryFilePreviews({content: event.content});
    },
  });

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

  const { mutate: postFactoryEvent, isSuccess: factoryEventPosted, isPending: factoryEventPostLoading, isError: factoryEventPostError } = useMutation({
    mutationFn: () => {
      const {name, contentTitle, projects, contentType, content} = factoryInput;
      if (!name || !contentTitle || projects.some(project => !project) || !factoryInput.locations || !contentType || content.some(item => !item)) {
        throw new Error("All factory event fields are required");
      }
      return factoryAPI.postFactoryEvent(factoryInput);
    },
    onSuccess: () => {
      setFactoryInput(defaultFactoryInput);
      setFactoryFilePreviews(defaultFactoryFilePreviews);
      if (factoryContentRef.current) factoryContentRef.current.value = null;
    },
  });

  const { mutate: editFactoryEventMutation, isSuccess: factoryEventEdited, isPending: factoryEventEditLoading, isError: factoryEventEditError } = useMutation({
    mutationFn: () => factoryAPI.editFactoryEvent(editFactoryEvent, factoryInput),
    onSuccess: () => getFactoryEventToEdit(),
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

  const changeFactoryInput = (e) => {
    setFactoryInput({...factoryInput, [e.target.name]: e.target.value});
  }

  const onFactoryArrayChange = (e, index) => {
    const values = [...factoryInput[e.target.name]];
    values[index] = e.target.name == "locations" && e.target.value != "" ? Number(e.target.value) : e.target.value;
    setFactoryInput({...factoryInput, [e.target.name]: values});
  }

  const addFactoryProject = () => {
    setFactoryInput({
      ...factoryInput,
      projects: [...factoryInput.projects, ""],
      parts: [...factoryInput.parts, ""],
      locations: [...factoryInput.locations, ""],
    });
  }

  const deleteFactoryProject = (index) => {
    setFactoryInput({
      ...factoryInput,
      projects: factoryInput.projects.filter((project, i) => i != index),
      parts: factoryInput.parts.filter((part, i) => i != index),
      locations: factoryInput.locations.filter((location, i) => i != index),
    });
  }

  const onFactoryContentUpload = (e, index, previews = [...factoryFilePreviews.content]) => {
    let file = e.target.files[0] || null;
    const content = [...factoryInput.content];
    content[index] = file;
    previews[index] = file ? URL.createObjectURL(file) : null;
    setFactoryInput({...factoryInput, content});
    setFactoryFilePreviews({...factoryFilePreviews, content: previews});
  }

  const addFactoryContentItem = () => {
    setFactoryInput({
      ...factoryInput,
      content: [...factoryInput.content, null],
      contentNames: [...factoryInput.contentNames, ""],
    });
    setFactoryFilePreviews({
      ...factoryFilePreviews,
      content: [...factoryFilePreviews.content, null],
    });
  }

  const deleteFactoryContentItem = (index) => {
    setFactoryInput({
      ...factoryInput,
      content: factoryInput.content.filter((content, i) => i != index),
      contentNames: factoryInput.contentNames.filter((name, i) => i != index),
    });
    setFactoryFilePreviews({
      ...factoryFilePreviews,
      content: factoryFilePreviews.content.filter((preview, i) => i != index),
    });
    if (factoryContentRef.current) factoryContentRef.current.value = null;
  }

  const onFactoryContentTypeChange = (e) => {
    const contentType = e.target.value;
    const contentLength = contentType == "audio" ? 2 : contentType == "musicVideo" ? 3 : contentType == "gallery" ? 1 : 1;
    const content = [...factoryInput.content];
    while (content.length < contentLength) content.push(null);
    setFactoryInput({
      ...factoryInput,
      contentType,
      content: content.slice(0, contentLength),
      contentNames: contentType == "gallery" ? [""] : [],
    });
    setFactoryFilePreviews({
      ...factoryFilePreviews,
      content: factoryFilePreviews.content.slice(0, contentLength),
    });
  }

  const onFactoryContentNameChange = (e, index) => {
    const contentNames = [...factoryInput.contentNames];
    contentNames[index] = e.target.value;
    setFactoryInput({...factoryInput, contentNames});
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

  const { mutate: deleteFactoryEvent, isError: factoryEventDeleteError } = useMutation({
    mutationFn: () => factoryAPI.deleteFactoryEvent(editFactoryEvent),
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

  const deleteFactoryEventClicked = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => {
        setConfirmDelete(false);
      }, 2000);
    }
    else deleteFactoryEvent();
  };

  return (
    <>
      <button onClick={returnHome}>Return to Home Page</button>
      {isAdmin &&
        <div className="adminPanel" style={{height: "750px"}}>
          <div style={{display: "flex", gap: "10px", height: "36px", alignItems: "center"}}>
            <h2 style={{margin: "0"}}>Logged in as admin</h2>
            <button style={{margin: "0"}} onClick={signOut}>Sign Out</button>
          </div>
          <h1>ADMIN PANEL</h1>
          <div className="postingModeButtons">
            <button onClick={() => setPostingMode("update")}>Post Update</button>
            <button onClick={() => setPostingMode("factory")}>Post Factory Event</button>
            <button onClick={() => setPostingMode("project")}>Post Project</button>
          </div>
          {postingMode == "update" && <div className="enterUpdate">
            <textarea onChange={changeUpdate} cols="50" rows="5" value={updateInput} />
            <button className="postUpdate" onClick={postUpdate}>Post an update</button>
            {updatePosted && <p>Update successfully posted</p>}
          </div>}
          {postingMode == "factory" && <div className="enterFactory" style={{height: "500px", overflowY: "scroll"}}>
            <h2>Create factory event</h2>
            <label htmlFor="factoryName">Name</label>
            <input id="factoryName" name="name" type="text" value={factoryInput.name} onChange={changeFactoryInput} />
            <label htmlFor="factoryContentTitle">Content Title</label>
            <input id="factoryContentTitle" name="contentTitle" type="text" value={factoryInput.contentTitle} onChange={changeFactoryInput} />
            <label htmlFor="factoryActive">
              <input id="factoryActive" name="active" type="checkbox" checked={factoryInput.active} onChange={e => setFactoryInput({...factoryInput, active: e.target.checked})} />
              Active
            </label>
            <label htmlFor="factoryProjects">Project Names</label>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
              {factoryInput.projects.map((project, index) =>
                <div key={`factoryProject${index}`} style={{display: "flex", flexDirection: "column"}}>
                  <input style={{width: "120px"}} name="projects" type="text" value={project} onChange={e => onFactoryArrayChange(e, index)} />
                  <select
                    aria-label={`Part for project ${index + 1}`}
                    name="parts"
                    value={factoryInput.parts[index] || ""}
                    onChange={e => onFactoryArrayChange(e, index)}
                  >
                    <option value="">Select part</option>
                    {Object.keys(factoryParts)
                      .filter(option => option == factoryInput.parts[index] || !factoryInput.parts.includes(option))
                      .map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <select
                    aria-label={`Location for project ${index + 1}`}
                    name="locations"
                    value={factoryInput.locations[index] || ""}
                    onChange={e => onFactoryArrayChange(e, index)}
                  >
                    <option value="">Select location</option>
                    {["Right of title", "Below links", "YouTube button", "Spotify button", "Link button", "Play button"]
                      .map((location, locationIndex) =>
                        <option key={location} value={locationIndex + 1}>{location}</option>
                      )}
                  </select>
                  <p />
                  <button onClick={() => deleteFactoryProject(index)}>Delete</button>
                </div>
              )}
              <button onClick={addFactoryProject} style={{width: "50px", height: "50px", fontSize: "16px"}}>Add</button>
            </div>
            <label htmlFor="factoryContentType">Content Type</label>
            <select id="factoryContentType" name="contentType" value={factoryInput.contentType} onChange={onFactoryContentTypeChange}>
              <option value=""></option>
              <option value="audio">Audio</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="musicVideo">Music Video</option>
              <option value="gallery">Gallery</option>
            </select>
            <label htmlFor="factoryContent">Content</label>
            {factoryInput.contentType == "audio" ? <>
              {factoryFilePreviews.content[0] && <audio controls src={factoryFilePreviews.content[0]} />}
              {factoryFilePreviews.content[0] && <button onClick={() => deleteFactoryContentItem(0)}>Delete</button>}
              <label htmlFor="factoryContent0" className="fileUpload">Upload Audio</label>
              <input id="factoryContent0" type="file" accept="audio/*" ref={factoryContentRef} onChange={e => onFactoryContentUpload(e, 0)} />
              {factoryFilePreviews.content[1] && <img height="200" src={factoryFilePreviews.content[1]} />}
              {factoryFilePreviews.content[1] && <button onClick={() => deleteFactoryContentItem(1)}>Delete</button>}
              <label htmlFor="factoryContent1" className="fileUpload">Upload Artwork</label>
              <input id="factoryContent1" type="file" accept="image/*" onChange={e => onFactoryContentUpload(e, 1)} />
            </> : factoryInput.contentType == "musicVideo" ? <>
              {factoryFilePreviews.content[0] && <video controls height="200" src={factoryFilePreviews.content[0]} />}
              {factoryFilePreviews.content[0] && <button onClick={() => deleteFactoryContentItem(0)}>Delete</button>}
              <label htmlFor="factoryContent0" className="fileUpload">Upload Video</label>
              <input id="factoryContent0" type="file" ref={factoryContentRef} onChange={e => onFactoryContentUpload(e, 0)} />
              {factoryFilePreviews.content[1] && <audio controls src={factoryFilePreviews.content[1]} />}
              {factoryFilePreviews.content[1] && <button onClick={() => deleteFactoryContentItem(1)}>Delete</button>}
              <label htmlFor="factoryContent1" className="fileUpload">Upload Audio</label>
              <input id="factoryContent1" type="file" accept="audio/*" onChange={e => onFactoryContentUpload(e, 1)} />
              {factoryFilePreviews.content[2] && <img height="200" src={factoryFilePreviews.content[2]} />}
              {factoryFilePreviews.content[2] && <button onClick={() => deleteFactoryContentItem(2)}>Delete</button>}
              <label htmlFor="factoryContent2" className="fileUpload">Upload Artwork</label>
              <input id="factoryContent2" type="file" accept="image/*" onChange={e => onFactoryContentUpload(e, 2)} />
            </> : factoryInput.contentType == "gallery" ? <div style={{display: "grid", gridTemplateColumns: `repeat(${Math.min(12, factoryInput.content.length + 1)}, 1fr)`}}>
              {factoryInput.content.map((file, index) =>
                <div key={`factoryContent${index}`}>
                  {factoryFilePreviews.content[index] && <img height="100" src={factoryFilePreviews.content[index]} />}
                  <input size="12" value={factoryInput.contentNames[index] || ""} onChange={e => onFactoryContentNameChange(e, index)} />
                  <label htmlFor={`factoryContent${index}`} className="fileUpload">Upload Image</label>
                  <input id={`factoryContent${index}`} type="file" accept="image/*" multiple onChange={e => onFactoryContentUpload(e, index)} />
                  <button onClick={() => deleteFactoryContentItem(index)}>Delete</button>
                </div>
              )}
              <button onClick={addFactoryContentItem} style={{width: "50px", height: "50px", fontSize: "16px"}}>Add</button>
            </div> : factoryInput.contentType ? <>
              {factoryFilePreviews.content[0] && (factoryInput.contentType == "image" ? <img height="200" src={factoryFilePreviews.content[0]} /> : <video controls height="200" src={factoryFilePreviews.content[0]} />)}
              {factoryFilePreviews.content[0] && <button onClick={() => deleteFactoryContentItem(0)}>Delete</button>}
              <label htmlFor="factoryContent" className="fileUpload">Upload Content</label>
              <input id="factoryContent" type="file" ref={factoryContentRef} onChange={e => onFactoryContentUpload(e, 0)} />
            </> : null}
            {(factoryEventPostLoading || factoryEventEditLoading) && <p>{editFactoryEvent ? "Updating" : "Posting"} factory event...</p>}
            {(factoryEventPosted || factoryEventEdited) && <p>Factory event successfully {editFactoryEvent ? "updated" : "posted"}</p>}
            {(factoryEventPostError || factoryEventEditError) && <p>Error {editFactoryEvent ? "updating" : "posting"} factory event</p>}
            <button onClick={editFactoryEvent ? editFactoryEventMutation : postFactoryEvent}>{editFactoryEvent ? "Edit event" : "Create factory event"}</button>
            {editFactoryEvent && <button onClick={deleteFactoryEventClicked}>{confirmDelete ? "Confirm" : "Delete Event"}</button>}
            {factoryEventDeleteError && <p>Error deleting factory event</p>}
          </div>}
          {postingMode == "project" && <div className="enterProject" style={{height: "500px", overflowY: "scroll"}}>
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
          </div>}
        </div>
      }
    </>
  )
}

export default AdminPanel;