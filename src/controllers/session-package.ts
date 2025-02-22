import { Response } from "express";
import User from "../models/User";
import SessionPackage from "../models/Session-package";
import { AuthRequest } from "../middleware/auth";

export const createPackage = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;

  const { name, clientId, sessionId, totalSessions, sessions, goals, therapistId } =
    req.body;

  if (
    !userId ||
    !name ||
    !clientId ||
    !sessionId ||
    !totalSessions ||
    !sessions ||
    !goals ||
    !therapistId
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
      therapistId,
      clientId,
      sessionId,
      status: "pending",
      totalSessions,
      sessions,
      goals,
      installmentStatus: "pending",
      createdBy: userId,
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
      sessionPackages = await SessionPackage.find({});
    } else if (user.role === "therapist") {
      sessionPackages = await SessionPackage.find({ therapistId: userId });
    }

    if (sessionPackages && sessionPackages.length > 0) {
      const sessionPackagesWithDetails = await Promise.all(
        sessionPackages.map(async (pkg) => {
          const client = await User.findById(pkg.clientId).select("name age");
          const therapist = await User.findById(pkg.therapistId).select("name");

          return {
            ...pkg.toObject(),
            clientName: client ? client.name : "Unknown",
            clientAge: client ? client.age : "Unknown",
            therapistName: therapist ? therapist.name : "Unknown",
          };
        })
      );

      const pendingPackages = sessionPackagesWithDetails.filter(
        (pkg) => pkg.status === "pending"
      );
      const approvedPackages = sessionPackagesWithDetails.filter(
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


export const getSessionPackageDetailsById = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const { packageId } = req.params;

  if (!userId || !packageId) {
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
          message: "Only admin or therapist can access it.",
          name: "AuthorizationError",
        },
      });
    }

    const sessionPackage = await SessionPackage.findById(packageId);

    if (!sessionPackage) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Session package does not exist.",
          name: "ValidationError",
        },
      });
    }
    const userDetails = await User.findById(sessionPackage.clientId).select("name age gender");
    const therapistDetails = await User.findById(sessionPackage.therapistId).select("name");

    if (!userDetails || !therapistDetails) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Client or Therapist does not exist.",
          name: "ValidationError",
        },
      });
    }

    res.status(200).json({
      Status: "success",
      Data: {
        name: sessionPackage.name,
        status: sessionPackage.status,
        totalSessions: sessionPackage.totalSessions,
        sessions: sessionPackage.sessions,
        goals: sessionPackage.goals,
        installmentStatus: sessionPackage.installmentStatus,
        date: sessionPackage.date,
        clientId: sessionPackage.clientId,
        clientName: userDetails.name,
        clientAge: userDetails.age,
        clientGender: userDetails.gender,
        therapistName: therapistDetails.name,
      }
    });
  } catch (error) {
    return res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal Server Error.",
        name: "ServerError",
      },
    });
  }
}

export const approveSessionPackage = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const { packageId } = req.params;

  if (!userId || !packageId) {
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

    if (user.role !== "admin") {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Only admin can approve a package.",
          name: "AuthorizationError",
        },
      });
    }

    const sessionPackage = await SessionPackage.findById(packageId);
    if (!sessionPackage) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Session package does not exist.",
          name: "ValidationError",
        },
      });
    }

    if (sessionPackage.status === "approved") {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Session package is already approved.",
          name: "ValidationError",
        },
      });
    }

    sessionPackage.status = "approved";
    await sessionPackage.save();

    res.status(200).json({
      Status: "success",
      Data: { sessionPackage }
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
}

export const rejectSessionPackage = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const { packageId } = req.params;

  if (!userId || !packageId) {
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

    if (user.role !== "admin") {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Only admin can reject a package.",
          name: "AuthorizationError",
        },
      });
    }

    const sessionPackage = await SessionPackage.findById(packageId);
    if (!sessionPackage) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Session package does not exist.",
          name: "ValidationError",
        },
      });
    }

    if (sessionPackage.status === "rejected") {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Session package is already rejected.",
          name: "ValidationError",
        },
      });
    }

    sessionPackage.status = "rejected";
    await sessionPackage.save();

    res.status(200).json({
      Status: "success",
      Data: { sessionPackage }
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
}