import express, { Request, Response } from "express";
import {
  signin,
  createUser,
  signup,
  getUserDetails,
} from "../controllers/user";
import auth from "../middleware/auth";
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

router.get("/get-user-details", auth, async (req: Request, res: Response) => {
  await getUserDetails(req, res);
});

export default router;
