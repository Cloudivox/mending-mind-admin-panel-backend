import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import {
  createPackage,
  getAllSessionPackages,
  getSessionPackageDetailsById,
  approveSessionPackage,
  rejectSessionPackage
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

router.get("/:packageId", auth, async (req: Request, res: Response) => {
  await getSessionPackageDetailsById(req, res);
});

router.put("/approve-session-package/:packageId", auth, async (req: Request, res: Response) => {
  await approveSessionPackage(req, res);
});

router.put("/reject-session-package/:packageId", auth, async (req: Request, res: Response) => {
  await rejectSessionPackage(req, res);
});

export default router;
