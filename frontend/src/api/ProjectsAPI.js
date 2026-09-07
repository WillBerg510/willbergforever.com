import API from "./BaseAPI.js";

const projectsAPI = {
  postProject: async (projectInput) => {
    const form = new FormData();
    Object.entries(projectInput).forEach(([key, value]) => {
      if (key == "gallery" || key == "content") {
        value?.forEach((image, index) => {
          form.append(`${key}${index}`, image);
        })
      } else if (key == "links") {
        if (value) Object.entries(value).forEach(([linkType, link]) => {
          form.append(linkType, link);
        });
      } if (Array.isArray(value)) {
        form.append(key, JSON.stringify(value));
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
      if (key == "gallery" || key == "content") {
        value?.forEach((image, index) => {
          if (image instanceof File) form.append(`${key}${index}`, image);
        })
      } else if (key == "links") {
        if (value) Object.entries(value).forEach(([linkType, link]) => {
          if (link != "") form.append(linkType, link);
        });
      } else if (key == "thumbnail") {
        if (value instanceof File) form.append(key, value);
      } else {
        if (Array.isArray(value)) {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, value);
        }
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

  getFromGroup: async (group) => {
    return await API.get(`/projects/group/${group}`);
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

  deleteProject: async (project_id) => {
    return await API.delete(`/projects/one/${project_id}`);
  },

  getRace: async (level) => {
    return await API.get(`/projects/race/${level}`);
  },
};

export default projectsAPI;