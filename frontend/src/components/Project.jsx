import projectsAPI from "../api/ProjectsAPI.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from '@tanstack/react-query';
import { projectReactions } from "../constants/reactions.js";
import projectGroups from "../constants/projectGroups.js";
import regions from "../constants/regions.js";
import '../stylesheets/Project.css';
import YouTubeIcon from "../assets/YouTube.svg";
import SpotifyIcon from "../assets/Spotify.svg";
import GlobeIcon from "../assets/Globe.svg";
import ViewIcon from "../assets/View.svg";

const linkIcons = {
  youtube: YouTubeIcon,
  spotify: SpotifyIcon,
  link: GlobeIcon,
}

const Project = (props) => {
  const { project_id, userRefresh, isAdmin, setOpenPlayer, closeWindows } = props;
  const [reactionStates, setReactionStates] = useState({});
  const [reactionNums, setReactionNums] = useState({});
  const [allReactions, setAllReactions] = useState(projectReactions);
  const [imagesReady, setImagesReady] = useState(0);
  const [thumbnailReady, setThumbnailReady] = useState(false);
  const navigate = useNavigate();

  const getReactionStates = (reactions) => {
    setReactionStates(Object.fromEntries(
      Object.keys(reactions).map(reaction => [reaction, project.reacted?.[reaction] || 0])
    ));
    setReactionNums(Object.fromEntries(
      Object.keys(reactions).map(reaction => [reaction, project.reactionNums?.[reaction] || 0])
    ));
  };

  const { mutate: addReaction } = useMutation({
    mutationFn: (reaction) => projectsAPI.addReaction(project._id, reaction),
    retry: (count, error) => {
      if (error.response.status == 500 && count < 1) {
        userRefresh();
        return true;
      }
      return false;
    },
    onSuccess: () => client.invalidateQueries([`project-${project_id}`]),
  });

  const { mutate: removeReaction } = useMutation({
    mutationFn: (reaction) => projectsAPI.removeReaction(project._id, reaction),
    retry: (count, error) => {
      if (error.response.status == 500 && count < 1) {
        userRefresh();
        return true;
      }
      return false;
    },
    onSuccess: () => client.invalidateQueries([`project-${project_id}`]),
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

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: [`project-${project_id}`],
    queryFn: () => {
      return projectsAPI.getProject(project_id).then(res => {
        res.data.project.date = new Date(res.data.project.date);
        return res.data.project;
      });
    },
    retry: (count, error) => {
      if (error.response.status == 500 && count < 1) {
        userRefresh();
        return true;
      }
      return false;
    },
  });

  useEffect(() => {
    if (project) {
      if (project.specialReaction) {
        const reactions = {...projectReactions, special: project.specialReaction};
        setAllReactions(reactions)
        getReactionStates(reactions);
      } else {
        getReactionStates(projectReactions);
      }
    }
  }, [project]);

  const projectLinkClicked = (linkType) => {
    window.open(project.links[linkType], "_blank");
  };

  const receiveClick = (e) => {
    e.stopPropagation();
  };

  const editProject = () => {
    navigate(`/admin?editProject=${project_id}`);
  };

  const onImageReady = () => {
    setImagesReady(prev => prev + 1);
  };

  const onThumbnailReady = () => {
    setThumbnailReady(true);
  };

  const onPlayerOpen = () => {
    closeWindows();
    setOpenPlayer(project_id);
  };

  return (
    <div style={{
      display: project ? "flex" : "none",
      '--project-color': regions.filter(region => region.code == project?.region.split("-")[0])[0]?.color || null,
    }} key={project_id|| "projectWindow"} className="projectWindow" onClick={receiveClick}>
      {projectLoading && <p>Loading...</p>}
      {!projectLoading && !project && <p>Unable to load project.</p>}
      {project && <div className="projectInfo">
        <div className="leftProjectColumn">
          <div className="projectThumbnail">
            <div className={`projectThumbnailCover ${thumbnailReady && "projectThumbnailCoverHidden"}`} />
            <div className={`projectThumbnailCover projectThumbnailCoverTwo ${thumbnailReady && "projectThumbnailCoverHidden"}`} />
            <img src={project.thumbnail} className="projectThumbnailImage" onLoad={onThumbnailReady} />
          </div>
          <h1 className="projectName">{project.name}</h1>
          <p className="projectDate">{project.date.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          })}</p>
          <div className="projectGroups">
            {project.groups?.map(group => 
              <div key={group} className="projectGroup">
                <img key={`${group}-icon`} className="projectGroupIcon" src={projectGroups[group]?.icon} />
                <p key={`${group}-text`} className="projectGroupText">{projectGroups[group]?.name.toUpperCase()}</p>
              </div>
            )}
          </div>
          {Object.keys(reactionStates).length > 0 && <div className="projectReactionsBar">
            {Object.entries(allReactions).map(([reactionName, reactionEmoji]) => 
              <button
                className={`projectReaction${reactionStates[reactionName]
                  ? " projectReactionSelected"
                  : ""
                }`}
                onClick={() => toggleReaction(reactionName)} key={project._id + reactionName}>
                <p className="projectReactionEmoji">{reactionEmoji}</p>
                <p className="projectReactionNumber">{reactionNums[reactionName] + reactionStates[reactionName]}</p>
              </button>
            )}
          </div>}
          {isAdmin && <button className="projectReaction editProject" onClick={editProject}>Edit project</button>}
        </div>
        <div className="rightProjectColumn">
          <p className="projectDescription">{project.description}</p>
          <div className={`projectGallery ${imagesReady == project.gallery.length && "projectGalleryReady"}`}>
            {project.gallery.map((image, index) =>
              <div className="projectGalleryImageContainer" key={`gallery${index}`}>
                <img className="projectGalleryImage" src={image} onLoad={onImageReady} />
              </div>
            )}
          </div>
          <div className="projectLinks">
            {["youtube", "spotify", "link"].map(linkType =>
              <div
                key={linkType}
                disabled={!project.links?.[linkType] || project.links[linkType] == ""}
                className={`projectLink projectLink${project.links?.[linkType] && project.links[linkType] != "" ? "Active" : "Inactive"}`}
                onClick={() => projectLinkClicked(linkType)}
              >
                <img src={linkIcons[linkType]} className="projectLinkIcon" />
                <p className="projectLinkText">{linkType.toUpperCase()}</p>
              </div>
            )}
            <div
              disabled={!project.content || project.content.length == 0}
              className={`projectLink projectLink${project.content && project.content.length > 0 ? "Active" : "Inactive"}`}
              onClick={onPlayerOpen}
            >
              <img src={ViewIcon} className="projectLinkIcon" />
              <p className="projectLinkText">{project.icon == "photos" || project.icon == "art" ? "VIEW" : "PLAY"}</p>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
};

export default Project;