"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.getAllNotes = exports.createNote = void 0;
const User_1 = __importDefault(require("../models/User"));
const Session_notes_1 = __importDefault(require("../models/Session-notes"));
const Session_1 = __importDefault(require("../models/Session"));
const createNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User does not exist.",
                    name: "ValidationError",
                },
            });
        }
        const session = yield Session_1.default.findById(sessionId);
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
        const note = yield Session_notes_1.default.create({
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
    }
    catch (error) {
        return res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal server error.",
                name: "ServerError",
            },
        });
    }
});
exports.createNote = createNote;
const getAllNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_Id;
    const { sessionId } = req.params;
    try {
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User does not exist.",
                    name: "ValidationError",
                },
            });
        }
        const session = yield Session_1.default.findById(sessionId);
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
        const notes = yield Session_notes_1.default.find({ sessionId, isDeleted: false }).sort({
            createdAt: -1,
        });
        const authorIds = notes.map((note) => note.authorId);
        const authors = yield User_1.default.find({ _id: { $in: authorIds } }).lean();
        // Create a map of authorId -> authorName
        const authorMap = authors.reduce((acc, author) => {
            acc[author._id.toString()] = author.name;
            return acc;
        }, {});
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
            Status: "success",
            Data: formattedNotes,
        });
    }
    catch (error) {
        return res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal server error.",
                name: "ServerError",
            },
        });
    }
});
exports.getAllNotes = getAllNotes;
const deleteNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_Id;
    const { noteId } = req.params;
    try {
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User does not exist.",
                    name: "ValidationError",
                },
            });
        }
        const note = yield Session_notes_1.default.findById(noteId);
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
        yield note.save();
        return res.status(200).json({
            Status: "success",
            Data: note,
        });
    }
    catch (error) {
        return res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal server error.",
                name: "ServerError",
            },
        });
    }
});
exports.deleteNote = deleteNote;
