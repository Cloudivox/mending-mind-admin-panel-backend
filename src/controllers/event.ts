import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import Event from "../models/Event";

export const createEvent = async (req: AuthRequest, res: Response) => {
  const {
    name,
    description,
    location,
    date,
    time,
    duration,
    participants,
    isPaid,
    price,
    host,
    hostDescription,
  } = req.body;
  const userId = req.user_Id;
  const createdBy = userId;
  const organizationId = req.params.organizationId;

  if (
    !createdBy ||
    !name ||
    !description ||
    !location ||
    !date ||
    !time ||
    !duration ||
    !host
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
    const user = await User.findById(createdBy);

    if (!user) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "User does not exist.",
          name: "ValidationError",
        },
      });
    }

    const newEvent = new Event({
      name,
      description,
      location,
      date,
      time,
      duration,
      participants,
      isPaid,
      price,
      eventType: "organization",
      createdAt: new Date().toISOString(),
      createdBy: createdBy,
      status: "upcoming",
      host,
      hostDescription,
      organizationId,
    });

    await newEvent.save();

    res.status(200).json({
      Status: "success",
      Data: newEvent,
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

export const getAllEvents = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const organizationId = req.params.organizationId;

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
    const events = await Event.find({
      organizationId: organizationId,
    }).sort({ createdAt: -1 });

    if (!events || events.length === 0) {
      return res.status(200).json({
        Status: "success",
        Data: [],
      });
    } else {
      const eventsWithParticipants = await Promise.all(
        events.map(async (event) => {
          const participants = await User.find(
            { _id: { $in: event.participants } },
            { _id: 1, name: 1, email: 1 }
          ).lean();

          const formattedParticipants = participants.map((participant) => ({
            id: participant._id.toString(),
            name: participant.name,
            email: participant.email,
          }));

          return {
            ...event.toObject(),
            participants: formattedParticipants,
          };
        })
      );

      return res.status(200).json({
        Status: "success",
        Data: eventsWithParticipants,
      });
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal Server Error.",
        name: "ServerError",
      },
    });
  }
};

export const joinEvent = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id as string;
  const { eventId } = req.params;

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

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Event not found.",
          name: "NotFoundError",
        },
      });
    }

    if (event.participants.includes(userId)) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "User already joined the event.",
          name: "DuplicateEntryError",
        },
      });
    }

    event.participants.push(userId);
    await event.save();

    res.status(200).json({
      Status: "success",
      Data: event,
    });
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal Server Error.",
        name: "ServerError",
      },
    });
  }
};
