import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import {
  createPackage,
  getAllSessionPackages,
} from "../controllers/session-package";

const router = express.Router();

router.post(
  "/create-session-package",
  auth,
  async (req: Request, res: Response) => {
    await createPackage(req, res);
  }
);

router.get(
  "/get-all-session-packages",
  auth,
  async (req: Request, res: Response) => {
    await getAllSessionPackages(req, res);
  }
);

export default router;
