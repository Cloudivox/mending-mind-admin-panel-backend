import express, { Request, Response } from "express";
import auth from "../middleware/auth";
import { createSession, getAllSessions, getSessionById } from "../controllers/session";


const router = express.Router();

router.post(
    "/create-session",
    auth,
    async (req: Request, res: Response) => {
        await createSession(req, res);
    }
);

router.get(
    "/get-all-sessions",
    auth,
    async (req: Request, res: Response) => {
        await getAllSessions(req, res);
    }
);

router.get("/:sessionId", auth, async (req: Request, res: Response) => {
    await getSessionById(req, res);
});



export default router;
