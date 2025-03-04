import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import {
  addTherapistInOrganization,
  createOrganization,
  deleteOrganization,
  deleteTherapistFromOrganization,
  getAllOrganizations,
  getDetailsByCode,
  updateOrganization,
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

router.post(
  "/update-organization",
  auth,
  async (req: Request, res: Response) => {
    await updateOrganization(req, res);
  }
);

router.delete(
  "/delete-organization",
  auth,
  async (req: Request, res: Response) => {
    await deleteOrganization(req, res);
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

router.delete(
  "/delete-therapist-organization/:organizationId/:therapistId",
  auth,
  async (req: Request, res: Response) => {
    await deleteTherapistFromOrganization(req, res);
  }
);

router.post(
  "/add-therapist/:organizationId/:therapistId",
  auth,
  async (req: Request, res: Response) => {
    await addTherapistInOrganization(req, res);
  }
);

export default router;
