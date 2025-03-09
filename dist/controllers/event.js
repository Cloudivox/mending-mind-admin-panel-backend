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
exports.joinEvent = exports.getAllEvents = exports.createEvent = void 0;
const User_1 = __importDefault(require("../models/User"));
const Event_1 = __importDefault(require("../models/Event"));
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, location, date, time, duration, participants, isPaid, price, host, hostDescription, } = req.body;
    const userId = req.user_Id;
    const createdBy = userId;
    if (!createdBy ||
        !name ||
        !description ||
        !location ||
        !date ||
        !time ||
        !duration ||
        !host) {
        return res.status(403).json({
            Status: "failure",
            Error: {
                message: "All fields are required.",
                name: "ValidationError",
            },
        });
    }
    try {
        const user = yield User_1.default.findById(createdBy);
        if (!user) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User does not exist.",
                    name: "ValidationError",
                },
            });
        }
        const newEvent = new Event_1.default({
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
        });
        yield newEvent.save();
        res.status(200).json({
            Status: "success",
            Data: newEvent,
        });
    }
    catch (error) {
        res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal Server Error.",
                name: "ServerError",
            },
        });
    }
});
exports.createEvent = createEvent;
const getAllEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_Id;
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
        const events = yield Event_1.default.find();
        if (!events || events.length === 0) {
            return res.status(200).json({
                Status: "success",
                Data: [],
            });
        }
        else {
            const eventsWithParticipants = yield Promise.all(events.map((event) => __awaiter(void 0, void 0, void 0, function* () {
                const participants = yield User_1.default.find({ _id: { $in: event.participants } }, { _id: 1, name: 1, email: 1 }).lean();
                const formattedParticipants = participants.map((participant) => ({
                    id: participant._id.toString(),
                    name: participant.name,
                    email: participant.email,
                }));
                return Object.assign(Object.assign({}, event.toObject()), { participants: formattedParticipants });
            })));
            return res.status(200).json({
                Status: "success",
                Data: eventsWithParticipants,
            });
        }
    }
    catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal Server Error.",
                name: "ServerError",
            },
        });
    }
});
exports.getAllEvents = getAllEvents;
const joinEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_Id;
    const { eventId } = req.params;
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
        const event = yield Event_1.default.findById(eventId);
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
        yield event.save();
        res.status(200).json({
            Status: "success",
            Data: event,
        });
    }
    catch (error) {
        console.error("Error joining event:", error);
        res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal Server Error.",
                name: "ServerError",
            },
        });
    }
});
exports.joinEvent = joinEvent;
