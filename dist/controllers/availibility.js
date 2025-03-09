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
exports.getAvailibilityByUserIdAndDate = exports.deleteAvailibility = exports.updateTime = exports.getAvailibility = exports.createAvailibility = void 0;
const User_1 = __importDefault(require("../models/User"));
const Availibility_1 = __importDefault(require("../models/Availibility"));
const createAvailibility = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const newAvailibility = new Availibility_1.default({
            userId: therapistId,
            date,
            startTime,
            endTime,
            type,
            status: "available",
            clientId: "",
            organizationId,
        });
        yield newAvailibility.save();
        res.status(200).json({
            Status: "success",
            Data: {
                availibility: newAvailibility,
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
exports.createAvailibility = createAvailibility;
const getAvailibility = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_Id;
    const { organizationId } = req.params;
    // Extract date from query parameters instead of route parameters
    const date = req.query.date; // typecast if needed
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
        const userRole = user.role;
        if (userRole === "admin" || userRole === "client") {
            // Fetch all availabilities and include therapist name
            availibility = yield Availibility_1.default.find({ date, organizationId }).populate({
                path: "userId",
                select: "name",
            });
        }
        else if (userRole === "therapist") {
            // Fetch only the therapist's own availabilities
            availibility = yield Availibility_1.default.find({
                userId,
                date,
                organizationId,
            }).populate({
                path: "userId",
                select: "name",
            });
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
        res.status(200).json({
            Status: "success",
            Data: {
                availibility,
                count: availibility.length,
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
exports.getAvailibility = getAvailibility;
const updateTime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const availibility = yield Availibility_1.default.findById(availibilityId);
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
        yield availibility.save();
        res.status(200).json({
            Status: "success",
            Data: availibility,
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
exports.updateTime = updateTime;
const deleteAvailibility = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const availibility = yield Availibility_1.default.findById(availibilityId);
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
        yield availibility.deleteOne();
        res.status(200).json({
            Status: "success",
            Data: {
                message: "Availibility deleted successfully.",
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
exports.deleteAvailibility = deleteAvailibility;
const getAvailibilityByUserIdAndDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, organizationId } = req.params;
    const date = req.query.date;
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
        const availibility = yield Availibility_1.default.find({
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal Server Error.",
                name: "ServerError",
            },
        });
    }
});
exports.getAvailibilityByUserIdAndDate = getAvailibilityByUserIdAndDate;
