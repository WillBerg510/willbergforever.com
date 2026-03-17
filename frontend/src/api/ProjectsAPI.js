import API from "./BaseAPI.js";

const projectsAPI = {
  postProject: async (projectInput) => {
    const form = new FormData();
    Object.entries(projectInput).forEach(([key, value]) => {
      if (key == "gallery") {
        value.forEach((image, index) => {
          form.append(`gallery${index}`, image);
        })
      } else if (key == "links") {
        Object.entries(value).forEach(([linkType, link]) => {
          form.append(linkType, link);
        });
      } else {
        form.append(key, value);
      }
    });
    return await API.post("/projects", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getProject: async (project_id) => {
    return await API.get(`/projects/${project_id}?requireUserToken=true`);
  },

  addReaction: async (project_id, reaction) => {
    return await API.patch(`/projects/react/${project_id}`, {
      reaction: reaction,
    });
  },

  removeReaction: async (project_id, reaction) => {
    return await API.patch(`/projects/unreact/${project_id}`, {
      reaction: reaction,
    });
  },
};

export default projectsAPI;