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
exports.rejectSessionPackage = exports.approveSessionPackage = exports.getSessionPackageDetailsById = exports.getAllSessionPackages = exports.createPackage = void 0;
const User_1 = __importDefault(require("../models/User"));
const Session_package_1 = __importDefault(require("../models/Session-package"));
const createPackage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_Id;
    const { name, clientId, sessionId, totalSessions, sessions, goals, therapistId } = req.body;
    if (!userId ||
        !name ||
        !clientId ||
        !sessionId ||
        !totalSessions ||
        !sessions ||
        !goals ||
        !therapistId) {
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
        if (user.role !== "admin" && user.role !== "therapist") {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Only admin or therapist can create a package.",
                    name: "ValidationError",
                },
            });
        }
        const newSessionPackage = new Session_package_1.default({
            name,
            therapistId,
            clientId,
            sessionId,
            status: "pending",
            totalSessions,
            sessions,
            goals,
            installmentStatus: "pending",
            createdBy: userId,
            date: new Date().toISOString(),
        });
        yield newSessionPackage.save();
        res.status(201).json({
            Status: "success",
            Data: { sessionPackage: newSessionPackage },
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
exports.createPackage = createPackage;
const getAllSessionPackages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (user.role !== "admin" && user.role !== "therapist") {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Only admin and therapist can access it.",
                    name: "AuthorizationError",
                },
            });
        }
        let sessionPackages;
        if (user.role === "admin") {
            sessionPackages = yield Session_package_1.default.find({});
        }
        else if (user.role === "therapist") {
            sessionPackages = yield Session_package_1.default.find({ therapistId: userId });
        }
        if (sessionPackages && sessionPackages.length > 0) {
            const sessionPackagesWithDetails = yield Promise.all(sessionPackages.map((pkg) => __awaiter(void 0, void 0, void 0, function* () {
                const client = yield User_1.default.findById(pkg.clientId).select("name age");
                const therapist = yield User_1.default.findById(pkg.therapistId).select("name");
                return Object.assign(Object.assign({}, pkg.toObject()), { clientName: client ? client.name : "Unknown", clientAge: client ? client.age : "Unknown", therapistName: therapist ? therapist.name : "Unknown" });
            })));
            const pendingPackages = sessionPackagesWithDetails.filter((pkg) => pkg.status === "pending");
            const approvedPackages = sessionPackagesWithDetails.filter((pkg) => pkg.status === "approved");
            res.status(200).json({
                Status: "success",
                Data: {
                    pendingPackages,
                    approvedPackages,
                    totalPendingCount: pendingPackages.length,
                    totalApprovedCount: approvedPackages.length,
                },
            });
        }
        else {
            res.status(200).json({
                Status: "success",
                Data: {
                    pendingPackages: [],
                    approvedPackages: [],
                    totalPendingCount: 0,
                    totalApprovedCount: 0,
                },
            });
        }
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
exports.getAllSessionPackages = getAllSessionPackages;
const getSessionPackageDetailsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_Id;
    const { packageId } = req.params;
    if (!userId || !packageId) {
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
        if (user.role !== "admin" && user.role !== "therapist") {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Only admin or therapist can access it.",
                    name: "AuthorizationError",
                },
            });
        }
        const sessionPackage = yield Session_package_1.default.findById(packageId);
        if (!sessionPackage) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Session package does not exist.",
                    name: "ValidationError",
                },
            });
        }
        const userDetails = yield User_1.default.findById(sessionPackage.clientId).select("name age gender");
        const therapistDetails = yield User_1.default.findById(sessionPackage.therapistId).select("name");
        if (!userDetails || !therapistDetails) {
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
            Data: {
                name: sessionPackage.name,
                status: sessionPackage.status,
                totalSessions: sessionPackage.totalSessions,
                sessions: sessionPackage.sessions,
                goals: sessionPackage.goals,
                installmentStatus: sessionPackage.installmentStatus,
                date: sessionPackage.date,
                clientId: sessionPackage.clientId,
                clientName: userDetails.name,
                clientAge: userDetails.age,
                clientGender: userDetails.gender,
                therapistName: therapistDetails.name,
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal Server Error.",
                name: "ServerError",
            },
        });
    }
});
exports.getSessionPackageDetailsById = getSessionPackageDetailsById;
const approveSessionPackage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_Id;
    const { packageId } = req.params;
    if (!userId || !packageId) {
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
                    message: "Only admin can approve a package.",
                    name: "AuthorizationError",
                },
            });
        }
        const sessionPackage = yield Session_package_1.default.findById(packageId);
        if (!sessionPackage) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Session package does not exist.",
                    name: "ValidationError",
                },
            });
        }
        if (sessionPackage.status === "approved") {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Session package is already approved.",
                    name: "ValidationError",
                },
            });
        }
        sessionPackage.status = "approved";
        yield sessionPackage.save();
        res.status(200).json({
            Status: "success",
            Data: { sessionPackage }
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
exports.approveSessionPackage = approveSessionPackage;
const rejectSessionPackage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_Id;
    const { packageId } = req.params;
    if (!userId || !packageId) {
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
                    message: "Only admin can reject a package.",
                    name: "AuthorizationError",
                },
            });
        }
        const sessionPackage = yield Session_package_1.default.findById(packageId);
        if (!sessionPackage) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Session package does not exist.",
                    name: "ValidationError",
                },
            });
        }
        if (sessionPackage.status === "rejected") {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Session package is already rejected.",
                    name: "ValidationError",
                },
            });
        }
        sessionPackage.status = "rejected";
        yield sessionPackage.save();
        res.status(200).json({
            Status: "success",
            Data: { sessionPackage }
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
exports.rejectSessionPackage = rejectSessionPackage;
