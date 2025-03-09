"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const EventSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    eventType: {
        type: String,
        required: true,
        enum: [
            "workshop",
            "seminar",
            "webinar",
            "support-group",
            "therapy-session",
            "conference",
            "community-meeting",
            "networking-event",
            "organization",
        ],
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: String, required: false },
    createdBy: { type: String, required: true },
    createdAt: { type: String, default: new Date().toISOString() },
    participants: { type: [String], default: [] }, // Array of user IDs
    status: {
        type: String,
        required: true,
        enum: ["upcoming", "ongoing", "completed", "cancelled"],
        default: "upcoming",
    },
    isPaid: { type: Boolean, required: true },
    price: {
        type: Number,
        required: function () {
            return this.isPaid;
        },
    }, // Only required if event is paid
    capacity: { type: Number, required: false }, // Optional: Max number of participants
    host: { type: String, required: true },
    hostDescription: { type: String, required: false },
}, {
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id; // Assign _id to id
            delete ret._id; // Remove _id
            delete ret.__v; // Remove __v (versioning field)
        },
    },
    toObject: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
});
exports.default = mongoose_1.default.model("Event", EventSchema);
