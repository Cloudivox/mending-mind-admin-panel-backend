import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import Session from "../models/Session";

export const createSession = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const {
    therapistId,
    clientId,
    sessionDateTime,
    duration,
    location,
    isNewClient,
    isPaid,
    type,
    name,
  } = req.body;

  if (
    !therapistId ||
    !clientId ||
    !sessionDateTime ||
    !duration ||
    !location ||
    !type ||
    !name
  ) {
    res.status(403).json({
      Status: "failure",
      Error: {
        message: "All fields are required.",
        name: "ValidationError",
      },
    });
    return;
  }

  try {
    const therapist = await User.findById(therapistId);
    if (!therapist) {
      res.status(403).json({
        Status: "failure",
        Error: {
          message: "Therapist does not exist.",
          name: "ValidationError",
        },
      });
      return;
    }

    const client = await User.findById(clientId);
    if (!client) {
      res.status(403).json({
        Status: "failure",
        Error: {
          message: "Client does not exist.",
          name: "ValidationError",
        },
      });
      return;
    }

    const newSession = new Session({
      therapistId,
      clientId,
      sessionDateTime,
      duration,
      location,
      isNewClient,
      isPaid,
      type,
      createdAt: new Date().toISOString(),
      name,
      rescheduledAt: "",
      rescheduledBy: "",
      rescheduledReason: "",
      status: "pending",
      isPackageCreated: false,
      packageId: "",
      createdBy: userId,
    });

    await newSession.save();

    res.status(201).json({
      Status: "success",
      Message: "Session created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal server error.",
        name: "InternalServerError",
      },
    });
  }
};

export const getAllSessions = async (req: AuthRequest, res: Response) => {
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

    let sessions;
    if (user.role === "admin") {
      sessions = await Session.find({});
    } else if (user.role === "therapist") {
      sessions = await Session.find({ therapistId: userId });
    }

    if (!sessions || sessions.length === 0) {
      return res.status(200).json({
        Status: "success",
        Data: [],
      });
    }

    const sessionsWithDetails = await Promise.all(
      sessions.map(async (session) => {
        const client = await User.findById(session.clientId).select(
          "name email phone"
        );
        const therapist = await User.findById(session.therapistId).select(
          "name"
        );

        return {
          ...session.toObject(),
          clientName: client ? client.name : "Unknown",
          clientEmail: client ? client.email : "-",
          clientPhone: client ? client.phone : "-",
          therapistName: therapist ? therapist.name : "Unknown",
        };
      })
    );

    const currentDate = new Date();

    const previousSessions = sessionsWithDetails.filter((session) => {
      // Use sessionDateTime instead of separate date and time fields
      const sessionDate = new Date(session.sessionDateTime);
      return sessionDate < currentDate;
    });

    const upcomingSessions = sessionsWithDetails.filter((session) => {
      // Use sessionDateTime instead of separate date and time fields
      const sessionDate = new Date(session.sessionDateTime);
      return sessionDate >= currentDate;
    });

    res.status(200).json({
      Status: "success",
      Data: {
        previous: previousSessions,
        upcoming: upcomingSessions,
      },
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

export const getSessionById = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const { sessionId } = req.params;

  if (!userId || !sessionId) {
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
          message: "Only admin and therapist can access it.",
          name: "AuthorizationError",
        },
      });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Session does not exist.",
          name: "ValidationError",
        },
      });
    }

    const client = await User.findById(session.clientId).select(
      "name email phone age gender"
    );
    const therapist = await User.findById(session.therapistId).select("name");

    if (!client || !therapist) {
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
        ...session.toObject(),
        clientName: client.name,
        clientEmail: client.email,
        clientPhone: client.phone,
        clientAge: client.age,
        clientGender: client.gender,
        therapistName: therapist.name,
      },
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
