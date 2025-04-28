import express from "express";
import config from "./utils/config.js";
import blogRouter from "./controllers/blogRouter.js";
import userRouter from "./controllers/userRouter.js";
import mongoose from "mongoose";
import middleware from "./utils/middleware.js";

const app = express();

mongoose
  .connect(config.MONGODB_URI)
  .then((result) => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("Error connecting to mongodb", error.message);
  });

app.use(express.json());
app.use("/api/blog", blogRouter);
app.use("/api/user", userRouter);

app.use(middleware.errorHandler);

export default app;
