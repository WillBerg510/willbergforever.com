import API from "./BaseAPI.js";

const adminAPI = {
  login: async (password) => {
    try {
      return await API.post("/admin/login", {
        password: password,
      }, {
        withCredentials: "include",
      });
    } catch (error) {
      alert(error);
    }
  },

  verify: async (auth_token) => {
    try {
      return await API.get("/admin/verify", {
        headers: {
          "Authorization": `Bearer ${auth_token}`,
        }
      });
    } catch (error) {
      console.log(error);
    }
  },

  signOut: async () => {
    try {
      return await API.post("/admin/signout", {}, {
        withCredentials: "include",
      })
    } catch (error) {
      alert(error);
    }
  },

  refresh: async () => {
    try {
      return await API.post("/admin/refresh", {}, {
        withCredentials: "include",
      })
    } catch (error) {
      alert(error);
    }
  },

};

export default adminAPI;