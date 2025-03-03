import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import {
  createNote,
  getAllNotes,
  deleteNote,
} from "../controllers/session-notes";

const router = express.Router();

router.post(
  "/create-note/:sessionId",
  auth,
  async (req: Request, res: Response) => {
    await createNote(req, res);
  }
);

router.get(
  "/get-all-notes/:sessionId",
  auth,
  async (req: Request, res: Response) => {
    await getAllNotes(req, res);
  }
);

router.delete(
  "/delete-note/:noteId",
  auth,
  async (req: Request, res: Response) => {
    await deleteNote(req, res);
  }
);

export default router;
