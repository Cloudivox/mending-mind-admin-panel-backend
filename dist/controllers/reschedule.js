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
exports.getAllReschedules = exports.rejectReschedule = exports.approveReschedule = exports.requestReschedule = void 0;
const User_1 = __importDefault(require("../models/User"));
const Reschedule_1 = __importDefault(require("../models/Reschedule"));
const Availibility_1 = __importDefault(require("../models/Availibility"));
const requestReschedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { availibilityId } = req.params;
    const userId = req.user_Id;
    const { reason, clientId, date, startTime, endTime, type } = req.body;
    if (!availibilityId ||
        !reason ||
        !clientId ||
        !date ||
        !startTime ||
        !endTime ||
        !type) {
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
        const newReschedule = new Reschedule_1.default({
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
        yield availibility.save();
        res.status(200).json({
            Status: "success",
            Data: {
                reschedule: newReschedule,
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
exports.requestReschedule = requestReschedule;
const approveReschedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (user.role !== "admin") {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Only admin can approve reschedule.",
                    name: "ValidationError",
                },
            });
        }
        const reschedule = yield Reschedule_1.default.findById(rescheduleId);
        if (!reschedule) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Request does not exist.",
                    name: "ValidationError",
                },
            });
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
        reschedule.status = "approved";
        availibility.rescheduledStatus = "approved";
        availibility.date = reschedule.date;
        availibility.startTime = reschedule.startTime;
        availibility.endTime = reschedule.endTime;
        yield reschedule.save();
        yield availibility.save();
        res.status(200).json({
            Status: "success",
            Data: {
                reschedule,
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
exports.approveReschedule = approveReschedule;
const rejectReschedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (user.role !== "admin") {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Only admin can reject reschedule.",
                    name: "ValidationError",
                },
            });
        }
        const reschedule = yield Reschedule_1.default.findById(rescheduleId);
        if (!reschedule) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Request does not exist.",
                    name: "ValidationError",
                },
            });
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
        reschedule.status = "rejected";
        availibility.rescheduledStatus = "rejected";
        yield reschedule.save();
        yield availibility.save();
        res.status(200).json({
            Status: "success",
            Data: {
                reschedule,
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
exports.rejectReschedule = rejectReschedule;
const getAllReschedules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        let reschedules;
        if (user.role === "admin") {
            // Find pending reschedules and populate therapist name
            reschedules = yield Reschedule_1.default.find({ status: "pending" })
                .sort({ date: -1, startTime: -1 })
                .populate("userId", "name"); // Fetch only the name of the therapist
        }
        else if (user.role === "therapist") {
            // Find reschedules for the therapist
            reschedules = yield Reschedule_1.default.find({ userId })
                .sort({ date: -1, startTime: -1 });
        }
        else {
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
        const formattedReschedules = reschedules.map((reschedule) => (Object.assign(Object.assign({}, reschedule.toObject()), { therapist_name: user.role === "admin" && reschedule.userId
                ? reschedule.userId.name
                : undefined })));
        res.status(200).json({
            Status: "success",
            Data: {
                reschedules: formattedReschedules,
                count: formattedReschedules.length,
            },
        });
    }
    catch (error) {
        console.error("Error fetching reschedules:", error);
        res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal Server Error.",
                name: "ServerError",
            },
        });
    }
});
exports.getAllReschedules = getAllReschedules;
