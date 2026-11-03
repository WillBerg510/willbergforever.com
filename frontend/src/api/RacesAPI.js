import API from "./BaseAPI.js";

const createRaceHash = async (value) => {
  const secret = import.meta.env.VITE_HMAC_SECRET;

  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {name: "HMAC", hash: "SHA-512"},
    false,
    ["sign"],
  );
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

const racesAPI = {
  getRaces: async () => {
    return await API.get("/races");
  },

  initiateRace: async (level) => {
    return await API.patch(`/races/initiate/${level}`);
  },

  submitRace: async (level, time, raceCode) => {
    const hash = await createRaceHash(`${time}/${raceCode}`);

    return await API.patch(`/races/submit/${level}`, {time}, {
      headers: {hash: hash},
    });
  },
};

export default racesAPI;
