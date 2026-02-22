const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Verify that a user's access token is valid
router.get("/verify", async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    jwt.verify(token, process.env.USER_ACCESS_TOKEN_SECRET);
    res.status(200).json({valid: true});
  } catch (err) {
    res.status(200).json({valid: false});
  }
});

// User token acquisition
router.post("/", async (req, res) => {
  try {
    const userId = crypto.randomUUID();
    const accessToken = jwt.sign({user: userId}, process.env.USER_ACCESS_TOKEN_SECRET, {expiresIn: "2h"});
    const refreshToken = jwt.sign({user: userId}, process.env.USER_REFRESH_TOKEN_SECRET, {expiresIn: "365d"});
    res.cookie('user_refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: (process.env.DEV_MODE ? false : true),
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({token: accessToken});
  } catch (err) {
    res.status(500).json({error: "User retrieval unsuccessful"});
  }
});

// User token renewal
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.user_refresh_token;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.USER_REFRESH_TOKEN_SECRET);
      const accessToken = jwt.sign({user: decoded.user}, process.env.USER_ACCESS_TOKEN_SECRET, {expiresIn: "2h"});
      const newRefreshToken = jwt.sign({user: decoded.user}, process.env.USER_REFRESH_TOKEN_SECRET, {expiresIn: "365d"});
      res.cookie('user_refresh_token', newRefreshToken, {
        httpOnly: true,
        sameSite: 'None',
        secure: (process.env.DEV_MODE ? false : true),
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({token: accessToken});
    } catch (err) {
      res.status(200).json({token: "n/a"});
    }
  } else {
    res.status(200).json({token: "n/a"});
  }
});

module.exports = router;