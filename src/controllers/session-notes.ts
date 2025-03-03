import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import SessionNotes from "../models/Session-notes";
import Session from "../models/Session";

export const createNote = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const { sessionId } = req.params;
  const { commentText } = req.body;

  if (!userId || !sessionId || !commentText) {
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

    if (user.role === "client" && session.clientId !== userId) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "You are not authorized to create note for this session.",
          name: "AuthorizationError",
        },
      });
    }

    const note = await SessionNotes.create({
      sessionId,
      authorId: userId,
      authorRole: user.role,
      commentText,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false,
      isDeleted: false,
    });

    return res.status(200).json({
      Status: "success",
      Data: note,
    });
  } catch (error) {
    return res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal server error.",
        name: "ServerError",
      },
    });
  }
};

export const getAllNotes = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const { sessionId } = req.params;

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

    if (user.role === "client" && session.clientId !== userId) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "You are not authorized to create note for this session.",
          name: "AuthorizationError",
        },
      });
    }

    const notes = await SessionNotes.find({ sessionId });

    const authorIds = notes.map((note) => note.authorId);
    const authors = await User.find({ _id: { $in: authorIds } }).lean();

    // Create a map of authorId -> authorName
    const authorMap = authors.reduce((acc, author) => {
      acc[author._id.toString()] = author.name;
      return acc;
    }, {} as Record<string, string>);

    // Format response
    const formattedNotes = notes.map((note) => ({
      id: note._id,
      sessionId: note.sessionId,
      authorId: note.authorId,
      authorName: authorMap[note.authorId] || "Unknown",
      authorRole: note.authorRole,
      commentText: note.commentText,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt || null,
    }));

    return res.status(200).json({
      status: "success",
      data: formattedNotes,
    });
  } catch (error) {
    return res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal server error.",
        name: "ServerError",
      },
    });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const { noteId } = req.params;

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

    const note = await SessionNotes.findById(noteId);
    if (!note) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Note does not exist.",
          name: "ValidationError",
        },
      });
    }

    if (user.role === "client" && note.authorId !== userId) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "You are not authorized to create note for this session.",
          name: "AuthorizationError",
        },
      });
    }

    note.isDeleted = true;
    await note.save();

    return res.status(200).json({
      Status: "success",
      Data: note,
    });
  } catch (error) {
    return res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal server error.",
        name: "ServerError",
      },
    });
  }
};
