const express = require('express');
const router = express.Router();
const auth = require("../utils/auth.js");
const jwt = require('jsonwebtoken');

router.post("/", async (req, res) => {
  const { password } = req.body;
  try {
    if (password != process.env.PASSWORD) {
      return res.status(401).json({error: "Incorrect password"});
    }
    const token = jwt.sign({"name": "Admin"}, process.env.TOKEN, {expiresIn: "1d"});
    res.status(200).json({token: token});
  } catch (err) {
    res.status(500).json({error: "Login unsuccessful"});
  }
});

router.head("/verify", auth, async (req, res) => {
  res.status(200).json({login: "True"});
})

module.exports = router;