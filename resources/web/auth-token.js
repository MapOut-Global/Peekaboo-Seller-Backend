const jwt = require("jsonwebtoken");
const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;

module.exports = {
  generate: async (data) => {
    return jwt.sign(data, jwtPrivateKey, { expiresIn: "1d" });
  },
  verify: async (token) => {
    return jwt.verify(token, jwtPrivateKey, (err, _) => {
      if (err) return 0;
      return 1;
    });
  }
};
