const jwt = require("../../resources/web/auth-token");

module.exports = async (req, res, next) => {
  const authHeader = await req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const isVerified = await jwt.verify(token);

    if (isVerified) {
      next();
    } else {
      res.status(401).send({ status: false, message: "Unauthorised access" });
    }
  } else {
    res.status(401).send({ status: false, message: "Unauthorised access" });
  }
};
