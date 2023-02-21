const jwt = require("jsonwebtoken");

function routerAuth(req, res, next) {

  try {
    tokenx = req.header("token");
    token = tokenx?.replace(/"/g, "");
    if (!token) return res.status(401).json({ Error: "Authentification Error." });
  } catch (e) {
    console.error("Error router Auth:  " + e);
    res.status(401).json({ Error: "Authentification Error." })
  }


  try {
    const decoded = jwt.verify(token, "mlou5iya");
    req.user = decoded.user;
    req.user.isAdmin = req.user.role === 'manager';


    next();

  } catch (e) {
    console.error("routerAuth: invalid token: " + e);
    res.status(500).send({ Error: "Session Expired!" });
  }

}


const isManager = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' });
  }
};

module.exports = {
  userAuth: routerAuth,
  isManager: isManager,

}