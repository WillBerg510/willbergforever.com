import API from "./BaseAPI.js";
import createHash from "./createHash.js";

const factoryAPI = {
  getFactoryEvent: async () => {
    return await API.get("/factory");
  },

  getContent: async (eventId) => {
    return await API.get(`/factory/${eventId}`);
  },

  submitFactoryProgress: async (projectId, factoryCode) => {
    const hash = await createHash(`${projectId}/${factoryCode}`);
    return await API.patch("/factory/submit", {project: projectId}, {
      headers: {hash: hash},
    });
  },

  getFactoryEventForEdit: async () => {
    return await API.get("/factory/edit");
  },

  postFactoryEvent: async (factoryEvent) => {
    return await factoryAPI.saveFactoryEvent("/factory", factoryEvent);
  },

  editFactoryEvent: async (eventId, factoryEvent) => {
    return await factoryAPI.saveFactoryEvent(`/factory/${eventId}`, factoryEvent, "patch");
  },

  deleteFactoryEvent: async (eventId) => {
    return await API.delete(`/factory/${eventId}`);
  },

  saveFactoryEvent: async (url, factoryEvent, method = "post") => {
    const form = new FormData();
    Object.entries(factoryEvent).forEach(([key, value]) => {
      if (key == "content") {
        value?.forEach((file, index) => {
          if (file instanceof File) form.append(`${key}${index}`, file);
        });
        if (value?.some(file => !(file instanceof File))) form.append(key, JSON.stringify(value));
      } else if (Array.isArray(value)) {
        form.append(key, JSON.stringify(value));
      } else {
        form.append(key, value);
      }
    });
    return await API.request({
      method,
      url,
      data: form,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default factoryAPI;
