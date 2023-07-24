const jwt = require("jsonwebtoken");

const secret = "mysecretsshhhhh";
const expiration = "2h";

module.exports = {
  signToken: ({ username, email, _id }) => {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },

  authMiddleware: (req) => {
    const token = req.body.token || req.query.token || req.headers.authorization?.split(" ").pop().trim();

    if (!token) {
      return req;
    }

    try {
      const { data } = jwt.verify(token, secret);
      req.user = data;
    } catch (err) {
      console.log("Invalid token");
    }
    return req;
  },
};