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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = "mending-mind-admin-panel";
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = typeof req.headers["accesstoken"] === "string"
            ? req.headers["accesstoken"].split(" ")[1]
            : undefined;
        if (!token) {
            const errorResponse = {
                Status: "failure",
                Error: {
                    message: "Unauthorized. No token provided.",
                    name: "AuthenticationError",
                    code: "EX-00103",
                },
            };
            res.status(405).json(errorResponse);
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (typeof decoded !== "string" && "id" in decoded) {
            req.user_Id = decoded.id;
        }
        next();
    }
    catch (error) {
        const errorResponse = {
            Status: "failure",
            Error: {
                message: "Invalid or expired token.",
                name: "AuthenticationError",
                code: "EX-00105",
            },
        };
        res.status(405).json(errorResponse);
    }
});
exports.default = auth;
