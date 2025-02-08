import { Request, Response } from "express";
import User from "../models/User";
import Availibility from "../models/Availibility";

export const createAvailibility = async (req: Request, res: Response) => {
  const { userId, date, startTime, endTime, type } = req.body;

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
      userId,
      date,
      startTime,
      endTime,
      type,
      status: "available",
      clientId: "",
    });

    await newAvailibility.save();

    res.status(200).json({
      Status: "success",
      Data: newAvailibility,
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

export const getAvailibility = async (req: Request, res: Response) => {
  const { userId } = req.params;

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

    if (user.role === "admin") {
      const availibility = await Availibility.find();

      res.status(200).json({
        Status: "success",
        Data: availibility,
      });
    } else if (user.role === "therapist") {
      const availibility = await Availibility.find({ userId });

      res.status(200).json({
        Status: "success",
        Data: availibility,
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
