import express, { Request, Response } from "express";
import { getProfileDetails, updateProfile } from "../controllers/profile";
import auth from "../middleware/auth";

const router = express.Router();

router.put("/update-profile", auth, async (req: Request, res: Response) => {
  await updateProfile(req, res);
});

router.get(
  "/get-profile-details/:userId",
  auth,
  async (req: Request, res: Response) => {
    await getProfileDetails(req, res);
  }
);

export default router;
