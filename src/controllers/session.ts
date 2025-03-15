import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import Session from "../models/Session";
import Availibility from "../models/Availibility";

export const createSession = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;

  const { organizationId } = req.params;

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
    availibilityId,
  } = req.body;

  if (
    !therapistId ||
    !clientId ||
    !sessionDateTime ||
    !duration ||
    !location ||
    !type ||
    !name ||
    !availibilityId
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

    const availibility = await Availibility.findById(availibilityId);

    if (!availibility) {
      res.status(403).json({
        Status: "failure",
        Error: {
          message: "Availibility does not exist.",
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
      organizationId,
      packageId: "",
      createdBy: userId,
    });

    await newSession.save();

    availibility.clientId = clientId;
    availibility.status = "booked";
    availibility.sessionId = newSession._id.toString();

    await availibility.save();

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
  const { organizationId } = req.params;

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

    // if (user.role !== "admin" && user.role !== "therapist") {
    //   return res.status(403).json({
    //     Status: "failure",
    //     Error: {
    //       message: "Only admin and therapist can access it.",
    //       name: "AuthorizationError",
    //     },
    //   });
    // }

    let sessions;
    if (user.role === "admin") {
      sessions = await Session.find({ organizationId });
    } else if (user.role === "therapist") {
      sessions = await Session.find({ therapistId: userId, organizationId });
    } else if (user.role === "client") {
      sessions = await Session.find({ clientId: userId, organizationId });
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
    currentDate.setHours(0, 0, 0, 0);

    const previousSessions = sessionsWithDetails.filter((session) => {
      const sessionDate = new Date(session.sessionDateTime);
      // A session is considered previous only if its entire date is before today
      const sessionStartOfDay = new Date(sessionDate);
      sessionStartOfDay.setHours(0, 0, 0, 0);
      return sessionStartOfDay < currentDate;
    });

    const upcomingSessions = sessionsWithDetails.filter((session) => {
      const sessionDate = new Date(session.sessionDateTime);
      const sessionStartOfDay = new Date(sessionDate);
      sessionStartOfDay.setHours(0, 0, 0, 0);
      return sessionStartOfDay >= currentDate;
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

export const getLatestSessionByClient = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        Status: "failure",
        Error: {
          message: "Client ID is required.",
          name: "ValidationError",
        },
      });
    }

    const latestSession = await Session.findOne({ clientId })
      .sort({ sessionDateTime: -1 })
      .limit(1);

    return res.status(200).json({
      Status: "success",
      Data: { data: latestSession || null },
    });
  } catch (error) {
    console.error("Error fetching latest session:", error);
    return res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal Server Error",
        name: "ServerError",
      },
    });
  }
};

export const getSessionDataForHome = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user_Id;
  const { organizationId } = req.params;

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

    // Base query depending on user role
    let query: any = { organizationId };
    if (user.role === "therapist") {
      query.therapistId = userId;
    }

    // Get current date at midnight (start of day) in ISO format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayISOString = today.toISOString();
    const tomorrowISOString = tomorrow.toISOString();
    const currentTimeISOString = new Date().toISOString();

    // Find completed sessions
    const completedSessions = await Session.countDocuments({
      ...query,
      sessionDateTime: { $lt: currentTimeISOString },
    });

    // Find upcoming sessions (sessions with datetime greater than current time)
    const upcomingSessions = await Session.countDocuments({
      ...query,
      sessionDateTime: { $gt: currentTimeISOString },
    });

    // Find today's sessions count
    const todaysSessions = await Session.countDocuments({
      ...query,
      sessionDateTime: {
        $gte: todayISOString,
        $lt: tomorrowISOString,
      },
    });

    return res.status(200).json({
      Status: "success",
      Data: {
        totalSessionsCompleted: completedSessions,
        totalUpcomingSessions: upcomingSessions,
        totalTodaysSessions: todaysSessions,
      },
    });
  } catch (error) {
    console.error("Error fetching session data for home:", error);
    return res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal Server Error",
        name: "ServerError",
      },
    });
  }
};
