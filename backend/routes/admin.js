const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Admin login and token acquisition
router.post("/login", async (req, res) => {
  const { password } = req.body;
  try {
    if (password != process.env.PASSWORD) {
      return res.status(401).json({error: "Incorrect password"});
    }
    const accessToken = jwt.sign({admin: true}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "2h"});
    const refreshToken = jwt.sign({admin: true}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: (process.env.DEV_MODE ? false : true),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({token: accessToken});
  } catch (err) {
    res.status(500).json({error: "Login unsuccessful"});
  }
});

// Admin token renewal
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (refreshToken) {
    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const accessToken = jwt.sign({admin: true}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "2h"});
      const newRefreshToken = jwt.sign({admin: true}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        sameSite: 'None',
        secure: (process.env.DEV_MODE ? false : true),
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({token: accessToken});
    } catch (err) {
      res.status(200).json({token: "n/a"});
    }
  } else {
    res.status(200).json({token: "n/a"});
  }
});

// Admin signout and revoking of refresh token
router.post("/signout", async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (refreshToken) {
    res.clearCookie('refresh_token');
  }
  res.status(200).json({message: "Signed out"});
});

// Verify if admin access token is valid
router.get("/verify", async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.status(200).json(decoded);
  } catch (err) {
    res.status(200).json({admin: false});
  }
});

module.exports = router;