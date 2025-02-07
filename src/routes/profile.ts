import express, { Request, Response, response } from "express";
import { updateProfile } from "../controllers/profile";
import auth from "../middleware/auth";

const router = express.Router();

router.put("/update-profile", auth, async (req: Request, res: Response) => {
  await updateProfile(req, res);
});

export default router;
