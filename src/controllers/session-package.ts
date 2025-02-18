import { Response } from "express";
import User from "../models/User";
import SessionPackage from "../models/Session-package";
import Availibility from "../models/Availibility";
import { AuthRequest } from "../middleware/auth";

export const createPackage = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;

  const { name, clientId, sessionId, totalSessions, sessions, goals } =
    req.body;

  if (
    !userId ||
    !name ||
    !clientId ||
    !sessionId ||
    !totalSessions ||
    !sessions ||
    !goals
  ) {
    return res.status(403).json({
      Status: "failure",
      Error: {
        message: "All fields are required.",
        name: "ValidationError",
      },
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "User does not exist.",
          name: "ValidationError",
        },
      });
    }
    if (user.role !== "admin" && user.role !== "therapist") {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Only admin or therapist can create a package.",
          name: "ValidationError",
        },
      });
    }

    const newSessionPackage = new SessionPackage({
      name,
      therapistId: userId,
      clientId,
      sessionId,
      status: "pending",
      totalSessions,
      sessions,
      goals,
      installmentStatus: "pending",
      date: new Date().toISOString(),
    });

    await newSessionPackage.save();

    res.status(201).json({
      Status: "success",
      Data: { sessionPackage: newSessionPackage },
    });
  } catch (error) {
    res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal Server Error.",
        name: "ServerError",
      },
    });
  }
};

export const getAllSessionPackages = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user_Id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "User does not exist.",
          name: "ValidationError",
        },
      });
    }

    if (user.role !== "admin" && user.role !== "therapist") {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Only admin and therapist can access it.",
          name: "AuthorizationError",
        },
      });
    }
    let sessionPackages;

    if (user.role === "admin") {
      // Admin gets all session packages
      sessionPackages = await SessionPackage.find({});
    } else if (user.role === "therapist") {
      // Therapist gets only their own session packages
      sessionPackages = await SessionPackage.find({ userId });
    }

    if (sessionPackages && sessionPackages.length > 0) {
      // Filtering packages into pending and approved categories
      const pendingPackages = sessionPackages.filter(
        (pkg) => pkg.status === "pending"
      );
      const approvedPackages = sessionPackages.filter(
        (pkg) => pkg.status === "approved"
      );

      res.status(200).json({
        Status: "success",
        Data: {
          pendingPackages,
          approvedPackages,
          totalPendingCount: pendingPackages.length,
          totalApprovedCount: approvedPackages.length,
        },
      });
    } else {
      res.status(200).json({
        Status: "success",
        Data: {
          pendingPackages: [],
          approvedPackages: [],
          totalPendingCount: 0,
          totalApprovedCount: 0,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal Server Error.",
        name: "ServerError",
      },
    });
  }
};
