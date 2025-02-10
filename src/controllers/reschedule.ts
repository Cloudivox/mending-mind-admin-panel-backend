import { Response } from "express";
import User from "../models/User";
import Reschedule from "../models/Reschedule";
import Availibility from "../models/Availibility";
import { AuthRequest } from "../middleware/auth";

export const requestReschedule = async (req: AuthRequest, res: Response) => {
  const { availibilityId } = req.params;
  const userId = req.user_Id;
  const { reason, clientId, date, startTime, endTime, type } = req.body;

  if (
    !availibilityId ||
    !reason ||
    !clientId ||
    !date ||
    !startTime ||
    !endTime ||
    !type
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

    const newReschedule = new Reschedule({
      availibilityId,
      userId,
      reason,
      clientId,
      date,
      startTime,
      endTime,
      type,
      status: "pending",
    });

    availibility.rescheduledStatus = "pending";
    await availibility.save();

    res.status(200).json({
      Status: "success",
      Data: {
        reschedule: newReschedule,
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

export const approveReschedule = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const { rescheduleId } = req.params;
  const { availibilityId } = req.body;

  if (!userId || !rescheduleId || !availibilityId) {
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
          message: "Only admin can approve reschedule.",
          name: "ValidationError",
        },
      });
    }
    const reschedule = await Reschedule.findById(rescheduleId);
    if (!reschedule) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Request does not exist.",
          name: "ValidationError",
        },
      });
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

    reschedule.status = "approved";
    availibility.rescheduledStatus = "approved";
    availibility.date = reschedule.date;
    availibility.startTime = reschedule.startTime;
    availibility.endTime = reschedule.endTime;

    await reschedule.save();
    await availibility.save();

    res.status(200).json({
      Status: "success",
      Data: {
        reschedule,
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

export const rejectReschedule = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const { rescheduleId } = req.params;
  const { availibilityId, reason } = req.body;

  if (!userId || !rescheduleId || !availibilityId) {
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
          message: "Only admin can reject reschedule.",
          name: "ValidationError",
        },
      });
    }
    const reschedule = await Reschedule.findById(rescheduleId);
    if (!reschedule) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Request does not exist.",
          name: "ValidationError",
        },
      });
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

    reschedule.status = "rejected";
    availibility.rescheduledStatus = "rejected";

    await reschedule.save();
    await availibility.save();

    res.status(200).json({
      Status: "success",
      Data: {
        reschedule,
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

export const getAllReschedules = async (req: AuthRequest, res: Response) => {
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

    let reschedules;

    if (user.role === "admin") {
      // Find pending reschedules and populate therapist name
      reschedules = await Reschedule.find({ status: "pending" })
        .sort({ date: -1, startTime: -1 })
        .populate("userId", "name"); // Fetch only the name of the therapist
    } else if (user.role === "therapist") {
      // Find reschedules for the therapist
      reschedules = await Reschedule.find({ userId })
        .sort({ date: -1, startTime: -1 });
    } else {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Unauthorized access.",
          name: "AuthorizationError",
        },
      });
    }

    if (!reschedules || reschedules.length === 0) {
      return res.status(200).json({
        Status: "success",
        Data: {
          reschedules: [],
          count: 0,
        },
      });
    }

    // If admin, attach therapist_name to each reschedule
    const formattedReschedules = reschedules.map((reschedule) => ({
      ...reschedule.toObject(),
      therapist_name: user.role === "admin" && reschedule.userId
        ? (reschedule.userId as any).name
        : undefined,
    }));

    res.status(200).json({
      Status: "success",
      Data: {
        reschedules: formattedReschedules,
        count: formattedReschedules.length,
      },
    });
  } catch (error) {
    console.error("Error fetching reschedules:", error);
    res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal Server Error.",
        name: "ServerError",
      },
    });
  }
};
