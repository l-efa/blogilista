import mongoose, { Schema } from "mongoose";
import config from "../utils/config.js";

const blogSchema = new Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

// const Blog = mongoose.model("Blog", blogSchema);

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
