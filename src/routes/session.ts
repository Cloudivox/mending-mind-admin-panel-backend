import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import {
  createSession,
  getAllSessions,
  getLatestSessionByClient,
  getSessionById,
} from "../controllers/session";

const router = express.Router();

router.post(
  "/create-session/:organizationId",
  auth,
  async (req: Request, res: Response) => {
    await createSession(req, res);
  }
);

router.get(
  "/get-all-sessions/:organizationId",
  auth,
  async (req: Request, res: Response) => {
    await getAllSessions(req, res);
  }
);

router.get("/:sessionId", auth, async (req: Request, res: Response) => {
  await getSessionById(req, res);
});

router.get(
  "/client-session/:clientId",
  auth,
  async (req: Request, res: Response) => {
    await getLatestSessionByClient(req, res);
  }
);

export default router;
