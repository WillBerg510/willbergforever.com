import API from "./BaseAPI.js";

const adminAPI = {
  login: async (password) => {
    return await API.post("/admin/login", {
      password: password,
    });
  },

  verify: async () => {
    return await API.post("/admin/verify");
  },

  signOut: async () => {
    return await API.post("/admin/signout");
  },

  refresh: async () => {
    return await API.post("/admin/refresh");
  },

};

export default adminAPI;