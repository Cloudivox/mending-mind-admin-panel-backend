import { Request, Response } from "express";
import User from "../models/User";
import Availibility from "../models/Availibility";
import { AuthRequest } from "../middleware/auth";

export const createAvailibility = async (req: AuthRequest, res: Response) => {
  const { date, startTime, endTime, type, therapistId } = req.body;
  const userId = req.user_Id;
  const { organizationId } = req.params;

  if (!userId || !date || !startTime || !endTime || !type) {
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

    const newAvailibility = new Availibility({
      userId: therapistId,
      date,
      startTime,
      endTime,
      type,
      status: "available",
      clientId: "",
      organizationId,
    });

    await newAvailibility.save();

    res.status(200).json({
      Status: "success",
      Data: {
        availibility: newAvailibility,
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

export const getAvailibility = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const { organizationId } = req.params;
  // Extract date from query parameters instead of route parameters
  const date = req.query.date as string; // typecast if needed

  if (!date) {
    return res.status(403).json({
      Status: "failure",
      Error: {
        message: "Date is required.",
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

    if (user.status !== "active") {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "User is not active.",
          name: "ValidationError",
        },
      });
    }

    let availibility;
    const userRole = user.role as string;

    if (userRole === "admin" || userRole === "client") {
      // Fetch all availabilities and include therapist name
      availibility = await Availibility.find({ date, organizationId }).populate(
        {
          path: "userId",
          select: "name",
        }
      );
    } else if (userRole === "therapist") {
      // Fetch only the therapist's own availabilities
      availibility = await Availibility.find({
        userId,
        date,
        organizationId,
      }).populate({
        path: "userId",
        select: "name",
      });
    } else {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Unauthorized access.",
          name: "AuthorizationError",
        },
      });
    }

    res.status(200).json({
      Status: "success",
      Data: {
        availibility,
        count: availibility.length,
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
export const updateTime = async (req: Request, res: Response) => {
  const { availibilityId, startTime, endTime, type } = req.body;

  if (!availibilityId || !startTime || !endTime || !type) {
    return res.status(403).json({
      Status: "failure",
      Error: {
        message: "All fields are required.",
        name: "ValidationError",
      },
    });
  }

  try {
    const availibility = await Availibility.findById(availibilityId);

    if (!availibility) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Availibility does not exist.",
          name: "ValidationError",
        },
      });
    }

    availibility.startTime = startTime;
    availibility.endTime = endTime;
    availibility.type = type;

    await availibility.save();

    res.status(200).json({
      Status: "success",
      Data: availibility,
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

export const deleteAvailibility = async (req: Request, res: Response) => {
  const { availibilityId } = req.body;

  if (!availibilityId) {
    return res.status(403).json({
      Status: "failure",
      Error: {
        message: "Availibility ID is required.",
        name: "ValidationError",
      },
    });
  }

  try {
    const availibility = await Availibility.findById(availibilityId);

    if (!availibility) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Availibility does not exist.",
          name: "ValidationError",
        },
      });
    }

    if (availibility.clientId && availibility.status === "booked") {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Availibility is booked. You can reschedule it.",
          name: "ValidationError",
        },
      });
    }

    await availibility.deleteOne();

    res.status(200).json({
      Status: "success",
      Data: {
        message: "Availibility deleted successfully.",
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

export const getAvailibilityByUserIdAndDate = async (
  req: AuthRequest,
  res: Response
) => {
  const { userId, organizationId } = req.params;
  const date = req.query.date as string;

  if (!date) {
    return res.status(403).json({
      Status: "failure",
      Error: {
        message: "Date is required.",
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

    if (user.role !== "therapist" && user.role !== "admin") {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "User is not a therapist.",
          name: "ValidationError",
        },
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "User is not active.",
          name: "ValidationError",
        },
      });
    }

    const availibility = await Availibility.find({
      userId,
      date,
      status: "available",
      organizationId,
    });

    res.status(200).json({
      Status: "success",
      Data: {
        availibility,
        count: availibility.length,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal Server Error.",
        name: "ServerError",
      },
    });
  }
};
