import { Response } from "express";
import User from "../models/User";
import SessionPackage from "../models/Session-package";
import Availibility from "../models/Availibility";
import { AuthRequest } from "../middleware/auth";

export const createPackage = async (req: AuthRequest, res: Response) => {};
