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
exports.getProfileDetails = exports.updateProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const Profile_1 = __importDefault(require("../models/Profile"));
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bio, qualification, specialization, experience, phone, userId, name, email, } = req.body;
        const user = yield User_1.default.findById(userId);
        console.log(user);
        if (!user) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User does not exist.",
                    name: "ValidationError",
                },
            });
        }
        if (name || email) {
            if (name !== user.name || email !== user.email || phone !== user.phone) {
                user.name = name;
                user.email = email;
                user.phone = phone;
                yield user.save();
            }
        }
        const profile = yield Profile_1.default.findOne({ userId });
        if (!profile) {
            const newProfile = new Profile_1.default({
                bio,
                qualification,
                specialization,
                experience,
                userId,
                age: user.age,
                gender: user.gender,
            });
            yield newProfile.save();
        }
        else {
            profile.bio = bio;
            profile.qualification = qualification;
            profile.specialization = specialization;
            profile.experience = experience;
            profile.age = user.age;
            profile.gender = user.gender;
            yield profile.save();
        }
        return res.status(200).json({
            Status: "success",
            Message: "Profile updated successfully.",
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
exports.updateProfile = updateProfile;
const getProfileDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                Status: "failure",
                Error: {
                    message: "User ID is required.",
                    name: "ValidationError",
                },
            });
        }
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User does not exist.",
                    name: "NotFoundError",
                },
            });
        }
        const profile = yield Profile_1.default.findOne({ userId });
        if (!profile) {
            return res.status(200).json({
                Status: "success",
                Message: "Profile not found, returning user details.",
                Data: {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    age: user.age,
                    gender: user.gender,
                },
            });
        }
        return res.status(200).json({
            Status: "success",
            Data: {
                userId: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                bio: profile.bio,
                qualification: profile.qualification,
                specialization: profile.specialization,
                experience: profile.experience,
                age: user.age,
                gender: user.gender,
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal Server Error.",
                name: "ServerError",
            },
        });
    }
});
exports.getProfileDetails = getProfileDetails;
