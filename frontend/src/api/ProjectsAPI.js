import API from "./BaseAPI.js";

const projectsAPI = {
  postProject: async (thumbnail) => {
    const form = new FormData();
    form.append("thumbnail", thumbnail);
    return await API.post("/projects", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default projectsAPI;