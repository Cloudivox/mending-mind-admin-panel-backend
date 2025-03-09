import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import connectDB from "./config/db";
import userRoutes from "./routes/user";
import profileRoutes from "./routes/profile";
import availabilityRoutes from "./routes/availibility";
import rescheduleRoutes from "./routes/reschedule";
import blogRoutes from "./routes/blog";
import sessionPackageRoutes from "./routes/session-package";
import sessionRoutes from "./routes/session";
import organizationRoutes from "./routes/organization";
import sessionNotesRoutes from "./routes/session-notes";
import eventRoutes from "./routes/event";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const httpServer = createServer(app);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/auth-service/v1/auth", userRoutes);
app.use("/auth-service/v1/profile", profileRoutes);
app.use("/availability-service/v1/availability", availabilityRoutes);
app.use("reschedule-session-service/v1/reschedule", rescheduleRoutes);
app.use("/blog-service/v1/blog", blogRoutes);
app.use("/session-package-service/v1/session-package", sessionPackageRoutes);
app.use("/session-service/v1/session", sessionRoutes);
app.use("/organization-service/v1/organization", organizationRoutes);
app.use("/session-notes-service/v1/session-notes", sessionNotesRoutes);
app.use("/event-service/v1/event", eventRoutes);

// 404 Error Handling Middleware
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized Error Handling Middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
);

connectDB();
httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
