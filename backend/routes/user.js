const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieOptions = require('../utils/cookieOptions');

// Verify whether a user's access token is valid
router.get("/verify", async (req, res) => {
  const token = req.cookies?.user_auth_token;
  if (token) {
    try {
      jwt.verify(token, process.env.USER_ACCESS_TOKEN_SECRET);
      res.status(200).json(true);
    } catch (err) {
      res.status(200).json(false);
    }
  } else {
    res.status(200).json(false);
  }
});

// User token acquisition
router.get("/", async (req, res) => {
  try {
    const userId = crypto.randomUUID();
    const accessToken = jwt.sign({user: userId}, process.env.USER_ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
    res.cookie('user_auth_token', accessToken, cookieOptions({minutes: 15}));
    const refreshToken = jwt.sign({user: userId}, process.env.USER_REFRESH_TOKEN_SECRET, {expiresIn: "365d"});
    res.cookie('user_refresh_token', refreshToken, cookieOptions({days: 365}));
    res.status(200).json();
  } catch (err) {
    res.status(500).json({error: "User retrieval unsuccessful"});
  }
});

// User token renewal, return whether it is a success
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.user_refresh_token;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.USER_REFRESH_TOKEN_SECRET);
      const accessToken = jwt.sign({user: decoded.user}, process.env.USER_ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
      res.cookie('user_auth_token', accessToken, cookieOptions({minutes: 15}));
      const newRefreshToken = jwt.sign({user: decoded.user}, process.env.USER_REFRESH_TOKEN_SECRET, {expiresIn: "365d"});
      res.cookie('user_refresh_token', newRefreshToken, cookieOptions({days: 365}));
      res.status(200).json(true);
    } catch (err) {
      res.status(200).json(false);
    }
  } else {
    res.status(200).json(false);
  }
});

module.exports = router;