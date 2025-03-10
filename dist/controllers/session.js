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
exports.getLatestSessionByClient = exports.getSessionById = exports.getAllSessions = exports.createSession = void 0;
const User_1 = __importDefault(require("../models/User"));
const Session_1 = __importDefault(require("../models/Session"));
const Availibility_1 = __importDefault(require("../models/Availibility"));
const createSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_Id;
    const { organizationId } = req.params;
    const { therapistId, clientId, sessionDateTime, duration, location, isNewClient, isPaid, type, name, availibilityId, } = req.body;
    if (!therapistId ||
        !clientId ||
        !sessionDateTime ||
        !duration ||
        !location ||
        !type ||
        !name ||
        !availibilityId) {
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
        const therapist = yield User_1.default.findById(therapistId);
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
        const client = yield User_1.default.findById(clientId);
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
        const availibility = yield Availibility_1.default.findById(availibilityId);
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
        const newSession = new Session_1.default({
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
        yield newSession.save();
        availibility.clientId = clientId;
        availibility.status = "booked";
        availibility.sessionId = newSession._id.toString();
        yield availibility.save();
        res.status(201).json({
            Status: "success",
            Message: "Session created successfully",
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal server error.",
                name: "InternalServerError",
            },
        });
    }
});
exports.createSession = createSession;
const getAllSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_Id;
    const { organizationId } = req.params;
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
            sessions = yield Session_1.default.find({ organizationId });
        }
        else if (user.role === "therapist") {
            sessions = yield Session_1.default.find({ therapistId: userId, organizationId });
        }
        else if (user.role === "client") {
            sessions = yield Session_1.default.find({ clientId: userId, organizationId });
        }
        if (!sessions || sessions.length === 0) {
            return res.status(200).json({
                Status: "success",
                Data: [],
            });
        }
        const sessionsWithDetails = yield Promise.all(sessions.map((session) => __awaiter(void 0, void 0, void 0, function* () {
            const client = yield User_1.default.findById(session.clientId).select("name email phone");
            const therapist = yield User_1.default.findById(session.therapistId).select("name");
            return Object.assign(Object.assign({}, session.toObject()), { clientName: client ? client.name : "Unknown", clientEmail: client ? client.email : "-", clientPhone: client ? client.phone : "-", therapistName: therapist ? therapist.name : "Unknown" });
        })));
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
exports.getAllSessions = getAllSessions;
const getSessionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const client = yield User_1.default.findById(session.clientId).select("name email phone age gender");
        const therapist = yield User_1.default.findById(session.therapistId).select("name");
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
            Data: Object.assign(Object.assign({}, session.toObject()), { clientName: client.name, clientEmail: client.email, clientPhone: client.phone, clientAge: client.age, clientGender: client.gender, therapistName: therapist.name }),
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
exports.getSessionById = getSessionById;
const getLatestSessionByClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId } = req.params;
        if (!clientId) {
            return res.status(400).json({
                status: "failure",
                error: {
                    message: "Client ID is required.",
                    name: "ValidationError",
                },
            });
        }
        // Find the latest session for the client
        const latestSession = yield Session_1.default.findOne({ clientId })
            .sort({ sessionDateTime: -1 }) // Sort by date descending
            .limit(1);
        return res.status(200).json({
            status: "success",
            data: latestSession || null, // Explicitly set `null` if no session is found
        });
    }
    catch (error) {
        console.error("Error fetching latest session:", error);
        return res.status(500).json({
            status: "failure",
            error: {
                message: "Internal Server Error",
                name: "ServerError",
            },
        });
    }
});
exports.getLatestSessionByClient = getLatestSessionByClient;
