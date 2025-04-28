import Blog from "../models/mongo.js";
import User from "../models/user.js";
import { Router } from "express";
const blogRouter = Router();
import middleware from "../utils/middleware.js";

const { jwtAuth, getToken } = middleware;

blogRouter.get("/", (request, response) => {
  Blog.find({})
    .populate("user", "username")
    .then((result) => {
      response.json(result);
    });
});

blogRouter.post("/", getToken, jwtAuth, async (request, response) => {
  const { title, author, url, likes } = request.body;

  const user = await User.findById(request.userId);
  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user._id,
  });

  let savedBlog;
  try {
    savedBlog = await blog.save();
  } catch (error) {
    return response.status(500).json({ error: "Error saving blog" });
  }

  // Fix: handle undefined blogs
  user.blogs = user.blogs.concat(savedBlog._id);

  try {
    await user.save();
  } catch (error) {
    return response.status(500).json({ error: "Error updating user" });
  }

  return response.status(201).json(savedBlog);
});

blogRouter.delete("/", getToken, jwtAuth, async (request, response) => {
  const { blogTitle } = request.body;

  const blog = await Blog.findOne({ title: blogTitle });

  console.log(blog);

  if (blog.user != request.userId) {
    return response.status(401).send("You have no authorization for this!");
  }

  const deletedBlog = await Blog.deleteOne({ title: blogTitle });

  if (!deletedBlog) {
    return response.status(401).send("Something went wrong!");
  }

  return response
    .status(201)
    .send("Blog ", deletedBlog.title, "Deleted succesfully!");
});

export default blogRouter;
