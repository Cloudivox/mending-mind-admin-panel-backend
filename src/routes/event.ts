import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import { createEvent, getAllEvents, joinEvent } from "../controllers/event";

const router = express.Router();

router.post(
  "/create-event/:organizationId",
  auth,
  async (req: Request, res: Response) => {
    await createEvent(req, res);
  }
);

router.get(
  "/get-all-events/:organizationId",
  auth,
  async (req: Request, res: Response) => {
    await getAllEvents(req, res);
  }
);

router.post(
  "/join-event/:eventId",
  auth,
  async (req: Request, res: Response) => {
    await joinEvent(req, res);
  }
);

export default router;
