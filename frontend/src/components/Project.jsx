import projectsAPI from "../api/ProjectsAPI.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from '@tanstack/react-query';
import { projectReactions } from "../constants/reactions.js";
import projectGroups from "../constants/projectGroups.js";
import '../stylesheets/Project.css';

const Project = (props) => {
  const { project_id, userRefresh, isAdmin } = props;
  const [reactionStates, setReactionStates] = useState({});
  const [reactionNums, setReactionNums] = useState({});
  const [allReactions, setAllReactions] = useState(projectReactions);
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
    }
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

  return (
    <div className="projectWindow" onClick={receiveClick}>
      {projectLoading && <p>Loading...</p>}
      {!projectLoading && !project && <p>Unable to load project.</p>}
      {project && <div className="projectInfo">
        <div className="leftProjectColumn">
          <img src={project.thumbnail} className="projectThumbnail" />
          <h1 className="projectName">{project.name}</h1>
          <p className="projectDate">{project.date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          }).toUpperCase()}</p>
          {project.groups.map(group => 
            <p key={group} className="projectGroup">{projectGroups[group].toUpperCase()}</p>
          )}
          {Object.keys(reactionStates).length > 0 && <div className="projectReactionsBar">
            {Object.entries(allReactions).map(([reactionName, reactionEmoji]) => 
              <button
                className={`updateLowerButton${reactionStates[reactionName]
                  ? " reactionSelected"
                  : ""
                }`}
                onClick={() => toggleReaction(reactionName)} key={project._id + reactionName}>
                <p className="reactionEmoji">{reactionEmoji}</p>
                <p className="reactionNumber">{reactionNums[reactionName] + reactionStates[reactionName]}</p>
              </button>
            )}
          </div>}
          {isAdmin && <button onClick={editProject}>Edit project</button>}
        </div>
        <div className="rightProjectColumn">
          <p className="projectDescription">{project.description}</p>
          <div className="projectGallery">
            {project.gallery.map((image, index) =>
              <img className="projectGalleryImage" key={`gallery${index}`} src={image} />
            )}
          </div>
          <div className="projectLinks">
            {["youtube", "spotify", "link"].map(linkType =>
              <button
                key={linkType}
                disabled={!project.links?.[linkType] || project.links[linkType] == ""}
                className={`projectLink projectLink${project.links?.[linkType] && project.links[linkType] != "" ? "Active" : "Inactive"}`}
                onClick={() => projectLinkClicked(linkType)}
              >
                {linkType.toUpperCase()}
              </button>
            )}
          </div>
        </div>
      </div>}
    </div>
  );
};

export default Project;