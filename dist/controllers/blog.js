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
exports.getAllBlogs = exports.createBlog = void 0;
const User_1 = __importDefault(require("../models/User"));
const Blog_1 = __importDefault(require("../models/Blog"));
const createBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, desc, author } = req.body;
    const userId = req.user_Id;
    if (!userId || !title || !desc || !author) {
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
        const newBlog = new Blog_1.default({
            userId,
            title,
            desc,
            author,
            status: user.role === "admin" ? "approved" : "pending",
        });
        yield newBlog.save();
        res.status(200).json({
            Status: "success",
            Data: {
                blog: newBlog,
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
exports.createBlog = createBlog;
const getAllBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        let filter = {};
        if (status === "approved" || status === "pending") {
            filter.status = status;
        }
        else if (status === "rejected") {
            filter.status = { $ne: "rejected" };
        }
        const blogs = yield Blog_1.default.find(filter, "title desc author _id status");
        res.status(200).json({
            Status: "success",
            Data: {
                blogs,
                count: blogs.length,
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
exports.getAllBlogs = getAllBlogs;
