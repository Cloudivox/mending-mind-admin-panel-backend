"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const db_1 = __importDefault(require("./config/db"));
const user_1 = __importDefault(require("./routes/user"));
const profile_1 = __importDefault(require("./routes/profile"));
const availibility_1 = __importDefault(require("./routes/availibility"));
const reschedule_1 = __importDefault(require("./routes/reschedule"));
const blog_1 = __importDefault(require("./routes/blog"));
const session_package_1 = __importDefault(require("./routes/session-package"));
const session_1 = __importDefault(require("./routes/session"));
const organization_1 = __importDefault(require("./routes/organization"));
const session_notes_1 = __importDefault(require("./routes/session-notes"));
const event_1 = __importDefault(require("./routes/event"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.use(express_1.default.json({ limit: "30mb" }));
app.use(express_1.default.urlencoded({ limit: "30mb", extended: true }));
app.use((0, cors_1.default)());
const httpServer = (0, http_1.createServer)(app);
app.get("/", (req, res) => {
    res.send("API is running...");
});
app.use("/auth-service/v1/auth", user_1.default);
app.use("/auth-service/v1/profile", profile_1.default);
app.use("/availability-service/v1/availability", availibility_1.default);
app.use("reschedule-session-service/v1/reschedule", reschedule_1.default);
app.use("/blog-service/v1/blog", blog_1.default);
app.use("/session-package-service/v1/session-package", session_package_1.default);
app.use("/session-service/v1/session", session_1.default);
app.use("/organization-service/v1/organization", organization_1.default);
app.use("/session-notes-service/v1/session-notes", session_notes_1.default);
app.use("/event-service/v1/event", event_1.default);
// 404 Error Handling Middleware
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});
// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ message: "Internal Server Error" });
});
(0, db_1.default)();
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
