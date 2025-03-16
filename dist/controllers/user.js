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
exports.clientRegistration = exports.getAllTherapist = exports.deleteUser = exports.updateUser = exports.getAllUsers = exports.getUserDetails = exports.signup = exports.createUser = exports.signin = exports.MENDING_MIND_ID = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const secret = "mending-mind-admin-panel";
exports.MENDING_MIND_ID = "67c42246019b4349af563057";
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(403).json({
            Status: "failure",
            Error: {
                message: "Email and password are required.",
                name: "ValidationError",
            },
        });
    }
    try {
        const existingUser = yield User_1.default.findOne({ email });
        if (!existingUser) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User does not exist.",
                    name: "ValidationError",
                },
            });
        }
        const isPasswordCorrect = yield bcryptjs_1.default.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Invalid credentials.",
                    name: "ValidationError",
                },
            });
        }
        const token = jsonwebtoken_1.default.sign({ email: existingUser.email, id: existingUser._id }, secret, { expiresIn: 8 * 60 * 60 });
        res.status(200).json({
            Status: "success",
            Data: {
                user: Object.assign({ email: existingUser.email, id: existingUser._id, role: existingUser.role, token }, (existingUser.role === "client" && {
                    organizationId: existingUser.organizationId,
                })),
            },
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal Server Error.",
                name: "ServerError",
            },
        });
    }
});
exports.signin = signin;
// **Create User**
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { organizationId } = req.params;
    const { email, role, name, phone } = req.body;
    if (!email || !role || !name) {
        return res.status(403).json({
            Status: "failure",
            Error: {
                message: "Email, role and Name are required.",
                name: "ValidationError",
            },
        });
    }
    try {
        const organization = yield Organization_1.default.findById(organizationId);
        if (!organization) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Organization does not exist.",
                    name: "ValidationError",
                },
            });
        }
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User already exists.",
                    name: "ValidationError",
                },
            });
        }
        const newUser = new User_1.default(Object.assign({ email,
            role, status: "pending", name, phone: phone ? phone : null }, (role === "client" && { organization: organizationId })));
        // Save the new user first
        yield newUser.save();
        if (role === "therapist") {
            if (exports.MENDING_MIND_ID !== organizationId) {
                const mendingMindOrg = yield Organization_1.default.findById(exports.MENDING_MIND_ID);
                if (mendingMindOrg) {
                    mendingMindOrg.therapists.push(String(newUser._id));
                    yield mendingMindOrg.save();
                }
            }
            organization.therapists.push(String(newUser._id));
            yield organization.save();
        }
        res.status(201).json({
            Status: "success",
            Data: { user: newUser },
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal Server Error.",
                name: "ServerError",
            },
        });
    }
});
exports.createUser = createUser;
// **Signup**
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(403).json({
            Status: "failure",
            Error: {
                message: "Email and password are required.",
                name: "ValidationError",
            },
        });
    }
    try {
        const existingUser = yield User_1.default.findOne({ email });
        if (!existingUser || existingUser.status !== "pending") {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User does not exist or is already active.",
                    name: "ValidationError",
                },
            });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        const updatedUser = yield User_1.default.findOneAndUpdate({ email }, { password: hashedPassword, status: "active" }, { new: true });
        if (!updatedUser) {
            return res.status(500).json({
                Status: "failure",
                Error: {
                    message: "User update failed.",
                    name: "ServerError",
                },
            });
        }
        const token = jsonwebtoken_1.default.sign({ email: updatedUser.email, id: updatedUser._id }, secret, { expiresIn: 8 * 60 * 60 });
        res.status(201).json({
            Status: "success",
            Data: {
                user: {
                    email: updatedUser.email,
                    id: updatedUser._id,
                    role: updatedUser.role,
                    token,
                },
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
exports.signup = signup;
const getUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.user_Id);
        if (!user) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User does not exist.",
                    name: "ValidationError",
                },
            });
        }
        res.status(200).json({
            Status: "success",
            Data: {
                user: {
                    email: user.email,
                    id: user._id,
                    role: user.role,
                },
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
exports.getUserDetails = getUserDetails;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const organizationId = req.params.organizationId;
    if (!organizationId) {
        return res.status(403).json({
            Status: "failure",
            Error: {
                message: "Organization Id is required.",
                name: "ValidationError",
            },
        });
    }
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const search = req.query.search || "";
        const type = req.query.role || "";
        // Calculate skip for pagination
        const skip = (page - 1) * limit;
        const organization = yield Organization_1.default.findById(organizationId);
        if (!organization) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Organization does not exist.",
                    name: "ValidationError",
                },
            });
        }
        // Build query filters
        const queries = [];
        if (search) {
            queries.push({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { role: { $regex: search, $options: "i" } },
                ],
            });
        }
        if (type) {
            const roles = type.split(",").map((role) => role.trim());
            const roleFilters = [];
            if (roles.includes("therapist")) {
                roleFilters.push({ _id: { $in: organization.therapists } });
            }
            if (roles.includes("client")) {
                roleFilters.push({
                    role: "client",
                    organizationId: new mongoose_1.default.Types.ObjectId(organizationId), // Ensure organizationId is treated correctly
                });
            }
            if (roleFilters.length > 0) {
                queries.push({ $or: roleFilters });
            }
        }
        // Combine queries if any filters are applied
        const searchQuery = queries.length ? { $and: queries } : {};
        // Get total count for pagination
        const totalUsers = yield User_1.default.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalUsers / limit);
        // Fetch paginated and filtered users
        const users = yield User_1.default.find(searchQuery, "email status name _id role organizationId")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        res.status(200).json({
            Status: "success",
            Data: {
                users: users || [],
                pagination: {
                    totalUsers,
                    totalPages,
                    currentPage: page,
                    limit,
                },
            },
        });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal Server Error.",
                name: "ServerError",
            },
        });
    }
});
exports.getAllUsers = getAllUsers;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id, email, role, name, phone } = req.body;
    if (!_id || !email || !role || !name) {
        return res.status(400).json({
            Status: "failure",
            Error: {
                message: "All fields (id, email, role, name) are required.",
                name: "ValidationError",
            },
        });
    }
    try {
        const user = yield User_1.default.findById(_id);
        if (!user) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User not found.",
                    name: "NotFoundError",
                },
            });
        }
        // Update fields
        user.email = email;
        user.role = role;
        user.name = name;
        user.phone = phone ? phone : null;
        yield user.save();
        res.status(200).json({
            Status: "success",
            Data: user,
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
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.body;
    if (!_id) {
        return res.status(403).json({
            Status: "failure",
            Error: {
                message: "User ID is required.",
                name: "ValidationError",
            },
        });
    }
    try {
        const user = yield User_1.default.findById(_id);
        if (!user) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User does not exist.",
                    name: "NotFoundError",
                },
            });
        }
        yield user.deleteOne();
        res.status(200).json({
            Status: "success",
            Data: {
                message: "User deleted successfully.",
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
exports.deleteUser = deleteUser;
const getAllTherapist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_Id;
    try {
        const isAdmin = yield User_1.default.findById(userId);
        if (!isAdmin) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Only admin can get all therapists.",
                    name: "ValidationError",
                },
            });
        }
        const therapists = yield User_1.default.find({ role: "therapist", status: "active" }, "email name id");
        res.status(200).json({
            Status: "success",
            Data: {
                therapists,
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
exports.getAllTherapist = getAllTherapist;
const clientRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { organizationId } = req.params;
    const { name, email, phone, password, age, gender } = req.body;
    if (!name || !email || !phone || !password || !age || !gender) {
        return res.status(403).json({
            Status: "failure",
            Error: {
                message: "Fields are required",
                name: "ValidationError",
            },
        });
    }
    try {
        const organization = yield Organization_1.default.findById(organizationId);
        if (!organization) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "Organization does not exist.",
                    name: "ValidationError",
                },
            });
        }
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User already exists.",
                    name: "ValidationError",
                },
            });
        }
        const newUser = new User_1.default({
            name,
            email,
            phone,
            password,
            age,
            gender,
            role: "client",
            organizationId: organizationId,
            status: "active",
        });
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        newUser.password = hashedPassword;
        yield newUser.save();
        const token = jsonwebtoken_1.default.sign({ email: newUser.email, id: newUser._id }, secret, {
            expiresIn: 8 * 60 * 60,
        });
        res.status(200).json({
            Status: "success",
            Data: {
                message: "User registered successfully.",
                user: {
                    email: newUser.email,
                    id: newUser._id,
                    role: newUser.role,
                    name: newUser.name,
                    token,
                },
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
exports.clientRegistration = clientRegistration;
