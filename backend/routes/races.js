const express = require('express');
const router = express.Router();
const Race = require("../models/Race.js");
const jwt = require('jsonwebtoken');
const refreshRaces = require("../utils/refreshRaces.js");
const crypto = require('crypto');

// Get information for all races
router.get("/", refreshRaces, async (req, res) => {
  const user_token = req.cookies?.user_auth_token;
  if (!user_token) res.status(500).json({error: "Missing cookie"});
  else {
    try {
      const races = await Race.find().select(["level", "times"]).lean();
      const decoded = jwt.verify(user_token, process.env.USER_ACCESS_TOKEN_SECRET);
      races.forEach(race => {
        race.userTime = race.times?.[decoded.user] || null;
        race.bestTime = Math.max(...Object.values(race.times));
        delete race.times;
      });
      res.status(200).json({races});
    } catch (err) {
      res.status(500).json({error: err.message});
    }
  }
});

// Initiate race
router.patch("/initiate/:level", async (req, res) => {
  const user_token = req.cookies?.user_auth_token;
  if (!user_token) res.status(500).json({error: "Missing cookie"});
  else {
    try {
      const race = await Race.findOne({level: req.params.level});
      const decoded = jwt.verify(user_token, process.env.USER_ACCESS_TOKEN_SECRET);
      if (!race.codes.get(decoded.user)) {
        const code = crypto.randomUUID();
        await Race.findOneAndUpdate(
          {level: req.params.level},
          {$set: {[`codes.${decoded.user}`]: code}}
        );
        res.status(200).json({code: code});
      } else {
        res.status(200).json({code: race.codes.get(decoded.user)});
      }
    } catch (err) {
      res.status(500).json({error: err.message});
    }
  }
});

// Send in race results
router.patch("/submit/:level", async (req, res) => {
  const user_token = req.cookies?.user_auth_token;
  if (!user_token) res.status(500).json({error: "Missing cookie"});
  else {
    try {
      const {time} = req.body;
      const {hash} = req.headers;
      const race = await Race.findOne({level: req.params.level});
      const decoded = jwt.verify(user_token, process.env.USER_ACCESS_TOKEN_SECRET);
      const expectedCode = race.codes.get(decoded.user);
      if (!expectedCode) {
        return res.status(500).json({error: "Race not initiated for this user"});
      }
      const expectedHash = crypto.createHmac("sha512", process.env.HMAC_SECRET)
        .update(`${time}/${expectedCode}`)
        .digest("hex");
      if (hash && crypto.timingSafeEqual(Buffer.from(expectedHash, "hex"), Buffer.from(hash, "hex"))) {
        if (race.times.get(decoded.user)) {
          return res.status(500).json("Race result already submitted today");
        }
        await Race.findOneAndUpdate(
          {level: req.params.level},
          {$set: {[`times.${decoded.user}`]: time}}
        );
        res.status(200).json("Race result submitted");
      } else {
        res.status(500).json({error: "Invalid code/hash"});
      }
    } catch (err) {
      res.status(500).json({error: err.message});
    }
  }
});

module.exports = router;