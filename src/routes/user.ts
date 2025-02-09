import express, { Request, Response } from "express";
import {
  signin,
  createUser,
  signup,
  getUserDetails,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllTherapist,
} from "../controllers/user";
import auth from "../middleware/auth";
const router = express.Router();

router.post("/signin", async (req: Request, res: Response) => {
  await signin(req, res);
});

router.post("/create", async (req: Request, res: Response) => {
  await createUser(req, res);
});

router.post("/signup", async (req: Request, res: Response) => {
  await signup(req, res);
});

router.get("/get-user-details", auth, async (req: Request, res: Response) => {
  await getUserDetails(req, res);
});

router.get("/get-all-users", auth, async (req: Request, res: Response) => {
  await getAllUsers(req, res);
});

router.put("/update-user", auth, async (req: Request, res: Response) => {
  await updateUser(req, res);
});

router.delete("/delete-user", auth, async (req: Request, res: Response) => {
  await deleteUser(req, res);
});

router.get("/get-all-therapists", auth, async (req: Request, res: Response) => {
  await getAllTherapist(req, res);
});

export default router;
