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
        if (value) Object.entries(value).forEach(([linkType, link]) => {
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

  editProject: async (project_id, projectInput) => {
    const form = new FormData();
    Object.entries(projectInput).forEach(([key, value]) => {
      if (key == "gallery") {
        value.forEach((image, index) => {
          if (image instanceof File) form.append(`gallery${index}`, image);
        })
      } else if (key == "links") {
        if (value) Object.entries(value).forEach(([linkType, link]) => {
          form.append(linkType, link);
        });
      } else if (key == "thumbnail") {
        if (value instanceof File) form.append(key, value);
      } else {
        form.append(key, value);
      }
    });
    return await API.patch(`/projects/${project_id}`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getFromRegion: async (region) => {
    return await API.get(`/projects/region/${region}`);
  },

  getProject: async (project_id) => {
    return await API.get(`/projects/${project_id}?requireUserToken=true`);
  },

  getProjectInfo: async (project_id) => {
    return await API.get(`/projects/${project_id}?requireUserToken=false`);
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