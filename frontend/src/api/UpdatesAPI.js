import API from "./BaseAPI.js";

const updatesAPI = {
  getUpdates: async () => {
    return await API.get("/updates");
  },

  postUpdate: async (update_text) => {
    return await API.post("/updates", {
      text: update_text,
      date: Date.now(),
    });
  },

  addReaction: async (update_id, reaction) => {
    return await API.patch(`/updates/react/${update_id}`, {
      reaction: reaction,
    });
  },

  removeReaction: async (update_id, reaction) => {
    return await API.patch(`/updates/unreact/${update_id}`, {
      reaction: reaction,
    });
  },

  deleteUpdate: async (update_id) => {
    return await API.delete(`/updates/one/${update_id}`);
  },

  clearUpdates: async () => {
    return await API.delete("/updates/clear");
  },
};

export default updatesAPI;