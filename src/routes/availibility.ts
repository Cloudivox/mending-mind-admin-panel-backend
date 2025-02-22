import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import {
  createAvailibility,
  deleteAvailibility,
  getAvailibility,
  updateTime,
  getAvailibilityByUserIdAndDate
} from "../controllers/availibility";

const router = express.Router();

router.post(
  "/create-availibility",
  auth,
  async (req: Request, res: Response) => {
    await createAvailibility(req, res);
  }
);

router.get("/get-availibility", auth, async (req: Request, res: Response) => {
  await getAvailibility(req, res);
});

router.put(
  "/update-availibility",
  auth,
  async (req: Request, res: Response) => {
    await updateTime(req, res);
  }
);

router.delete(
  "/delete-availibility",
  auth,
  async (req: Request, res: Response) => {
    await deleteAvailibility(req, res);
  }
);

router.get(
  "/:userId",
  auth,
  async (req: Request, res: Response) => {
    await getAvailibilityByUserIdAndDate(req, res);
  }
)
export default router;
