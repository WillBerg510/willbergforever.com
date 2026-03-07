const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieOptions = require('../utils/cookieOptions');

// Admin login and token acquisition
router.post("/login", async (req, res) => {
  const { password } = req.body;
  try {
    if (password != process.env.PASSWORD) {
      return res.status(401).json({error: "Incorrect password"});
    }
    const accessToken = jwt.sign({admin: true}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "2h"});
    res.cookie('auth_token', accessToken, cookieOptions({hours: 2}));
    const refreshToken = jwt.sign({admin: true}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
    res.cookie('refresh_token', refreshToken, cookieOptions({days: 7}));
    res.status(200).json();
  } catch (err) {
    res.status(500).json({error: "Login unsuccessful"});
  }
});

// Admin token renewal, return whether it is a success
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (refreshToken) {
    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const accessToken = jwt.sign({admin: true}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "2h"});
      res.cookie('auth_token', accessToken, cookieOptions({hours: 2}));
      const newRefreshToken = jwt.sign({admin: true}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
      res.cookie('refresh_token', newRefreshToken, cookieOptions({days: 7}));
      res.status(200).json(true);
    } catch (err) {
      res.status(200).json(false);
    }
  } else {
    res.status(200).json(false);
  }
});

// Admin signout and revoking of refresh token
router.post("/signout", async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (refreshToken) {
    res.clearCookie('refresh_token');
  }
  const accessToken = req.cookies?.auth_token;
  if (accessToken) {
    res.clearCookie('auth_token');
  }
  res.status(200).json({message: "Signed out"});
});

// Verify whether admin access token is valid
router.get("/verify", async (req, res) => {
  const token = req.cookies?.auth_token;
  if (token) {
    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      res.status(200).json(true);
    } catch (err) {
      res.status(200).json(false)
    }
  } else {
    res.status(200).json(false);
  }
});

module.exports = router;