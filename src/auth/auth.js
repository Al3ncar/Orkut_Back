const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ msg: "Token Invalido" });
  }

  try {
    const decode = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decode
    next()
  } catch (err) {
    res.status(401).json({msg: "Token invalido"})
  }
};

module.exports = auth;
