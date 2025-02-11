import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import { createBlog, getAllBlogs } from "../controllers/blog";

const router = express.Router();

router.post("/create-blog", auth, async (req: Request, res: Response) => {
  await createBlog(req, res);
});

router.get("/get-all-blogs", auth, async (req: Request, res: Response) => {
  await getAllBlogs(req, res);
});

export default router;
