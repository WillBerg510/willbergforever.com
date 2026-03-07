import API from "./BaseAPI.js";

const userAPI = {
  verify: async () => {
    return await API.post("/user/verify");
  },

  getUser: async () => {
    return await API.get("/user");
  },

  refresh: async () => {
    return await API.post("/user/refresh");
  },
};

export default userAPI;