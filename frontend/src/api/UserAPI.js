import API from "./BaseAPI.js";

const userAPI = {
  verify: async (user_auth_token) => {
    try {
      return await API.get("/user/verify", {
        headers: {
          "Authorization": `Bearer ${user_auth_token}`,
        },
      });
    } catch (error) {
      console.log(error);
    }
  },

  getUser: async () => {
    try {
      return await API.post("/user", {}, {
        withCredentials: "include",
      });
    } catch (error) {
      alert(error);
    }
  },

  refresh: async () => {
    try {
      return await API.post("/user/refresh", {}, {
        withCredentials: "include",
      });
    } catch (error) {
      alert(error);
    }
  },
};

export default userAPI;