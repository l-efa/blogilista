import jwt from "jsonwebtoken";
import config from "./config.js";

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    return response
      .status(400)
      .json({ error: "expected `username` to be unique" });
  }

  next(error);
};

const jwtAuth = (request, response, next) => {
  const token = request.token;

  try {
    const decodedToken = jwt.verify(token, config.SECRET);
    console.log(decodedToken);

    if (!decodedToken.id) {
      return response.status(401).json({ error: "Token missing or invalid" });
    }

    request.userId = decodedToken.id; //Attach user id to request if needed
    next();
  } catch (error) {
    return response.status(401).json({ error: "Token verification failed" });
  }
};

const getToken = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    request.token = authorization.replace("Bearer ", "");
  }
  next();
};

export default { errorHandler, jwtAuth, getToken };
