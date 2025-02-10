import express, { Request, Response } from "express";

import auth from "../middleware/auth";
import { approveReschedule, getAllReschedules, rejectReschedule, requestReschedule } from "../controllers/reschedule";

const router = express.Router();

router.post("/reschedule-request/:availibilityId", auth, async (req: Request, res: Response) => {
    await requestReschedule(req, res);
});

router.put("/reschedule-approve/:rescheduleId", auth, async (req: Request, res: Response) => {
    await approveReschedule(req, res);
});

router.put("/reschedule-reject/:rescheduleId", auth, async (req: Request, res: Response) => {
    await rejectReschedule(req, res);
});

router.get("/reschedule-requests", auth, async (req: Request, res: Response) => {
    await getAllReschedules(req, res);
});

export default router;
