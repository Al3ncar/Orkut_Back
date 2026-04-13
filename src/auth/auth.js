const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      message: "SEM TOKEN",
    });
  }

  try {
    const decode = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decode;
    console.log(req.user);
    
    next();
  } catch (err) {
    return res.status(401).json({ message: "token invalido" });
  }
};

module.exports = auth;
