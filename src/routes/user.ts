import express, { Request, Response } from "express";
import { signin, createUser, signup } from "../controllers/user";
const router = express.Router();

router.post("/signin", async (req: Request, res: Response) => {
  await signin(req, res);
});

router.post("/create", async (req: Request, res: Response) => {
  await createUser(req, res);
});

router.post("/signup", async (req: Request, res: Response) => {
  await signup(req, res);
});

export default router;
