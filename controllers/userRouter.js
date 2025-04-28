import { response, Router } from "express";
import Blog from "../models/mongo.js";
import User from "../models/user.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import user from "../models/user.js";
const userRouter = Router();
import config from "../utils/config.js";
import jwt from "jsonwebtoken";

userRouter.get("/", (request, response) => {
  User.find({})
    .then((result) => {
      if (!result) console.log("No users currently!");

      response.status(201).json(result);
    })
    .catch((error) => {
      console.error(error);
      response.send(204);
    });
});

userRouter.post("/register", async (request, response) => {
  const { username, password } = request.body;

  if (!username || !password) {
    return response
      .status(400)
      .json({ error: "Username and password are required" });
  }

  if (username.length < 3)
    return response.status(400).json("Error. Username too short");

  const existingUser = await User.findOne({ username: username }).then(
    (result) => {
      if (result)
        return response.status(400).json("This username is already in use");
    }
  );

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  console.log(hash);
  console.log(username, password);

  const user = new User({
    username: username,
    hashedpassword: hash,
  });

  console.log(user);

  const savedUser = await user.save().catch((error) => {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return response.status(400).json({ error: "Username already exists" });
    } else {
      return response.status(500).json({ error: error.message });
    }
  });

  if (savedUser) {
    return response.status(201).json(savedUser);
  }
});

userRouter.post("/login", async (request, response) => {
  const { username, password } = request.body;

  console.log(username, password);

  const checkUser = await User.findOne({ username: username });

  if (!checkUser) {
    return response.status(401).send("Incorrect username!");
  }

  console.log("checkuser: ", checkUser);

  const passwordCorrect = await bcrypt.compare(
    password,
    checkUser.hashedpassword
  );

  if (!passwordCorrect) {
    return response.status(401).send("incorrect password");
  }

  console.log("username and password correct, logging in!");

  const userForToken = {
    username: checkUser.username,
    id: checkUser._id,
  };

  const token = jwt.sign(userForToken, config.SECRET, { expiresIn: 60 * 60 });
  return response.status(200).json({
    token,
    username: checkUser.username,
  });
});

export default userRouter;
