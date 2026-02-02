const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token == "null") {
    return res.status(401).json({error: 'Missing auth token.'});
  }
  try {
    jwt.verify(token, process.env.TOKEN);
    next();
  } catch {
    return res.status(401).json({error: 'Invalid auth token.'});
  }
}

module.exports = auth;