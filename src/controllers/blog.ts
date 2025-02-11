import { Request, Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import Blog from "../models/Blog";

export const createBlog = async (req: AuthRequest, res: Response) => {
  const { title, desc, author } = req.body;
  const userId = req.user_Id;

  if (!userId || !title || !desc || !author) {
    return res.status(403).json({
      Status: "failure",
      Error: {
        message: "All fields are required.",
        name: "ValidationError",
      },
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "User does not exist.",
          name: "ValidationError",
        },
      });
    }

    const newBlog = new Blog({
      userId,
      title,
      desc,
      author,
      status: user.role === "admin" ? "approved" : "pending",
    });

    await newBlog.save();

    res.status(200).json({
      Status: "success",
      Data: {
        blog: newBlog,
      },
    });
  } catch (error) {
    res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal Server Error.",
        name: "ServerError",
      },
    });
  }
};

export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let filter: any = {};
    if (status === "approved" || status === "pending") {
      filter.status = status; 
    } else if (status === "rejected") {
      filter.status = { $ne: "rejected" };
    }

    const blogs = await Blog.find(filter, "title desc author _id status");

    res.status(200).json({
      Status: "success",
      Data: {
        blogs,
        count: blogs.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal Server Error.",
        name: "ServerError",
      },
    });
  }
};
