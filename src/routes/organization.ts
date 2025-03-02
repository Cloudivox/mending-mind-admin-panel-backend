import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import {
  createOrganization,
  getAllOrganizations,
  getDetailsByCode,
  verifyCode,
} from "../controllers/organization";

const router = express.Router();

router.post(
  "/create-organization",
  auth,
  async (req: Request, res: Response) => {
    await createOrganization(req, res);
  }
);

router.get(
  "/get-all-organizations",
  auth,
  async (req: Request, res: Response) => {
    await getAllOrganizations(req, res);
  }
);

router.post("/verify-code", async (req: Request, res: Response) => {
  await verifyCode(req, res);
});

router.get("/:code", auth, async (req: Request, res: Response) => {
  await getDetailsByCode(req, res);
});

export default router;
