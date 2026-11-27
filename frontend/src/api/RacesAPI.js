import API from "./BaseAPI.js";
import createHash from "./createHash.js";

const racesAPI = {
  getRaces: async () => {
    return await API.get("/races");
  },

  initiateRace: async (level) => {
    return await API.patch(`/races/initiate/${level}`);
  },

  submitRace: async (level, time, raceCode) => {
    const hash = await createHash(`${time}/${raceCode}`);
    return await API.patch(`/races/submit/${level}`, {time}, {
      headers: {hash: hash},
    });
  },
};

export default racesAPI;
