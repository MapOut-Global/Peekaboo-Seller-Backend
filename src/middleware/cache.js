const redisMiddleware = async (req, res, next) => {
  let path = req.path;
  let param;
  const queryObj = req.query;
  const bodyObj = req.body;

  if (!Object.keys(queryObj).length && !Object.keys(bodyObj).length) {
    path = path.split("/");
    param = path[path.length - 1];
    path.pop();
    path = path.join("/");
  }

  switch (path) {
    case "/api/":
      next();
      break;
    default:
      next();
      break;
  }
};

module.exports = redisMiddleware;
