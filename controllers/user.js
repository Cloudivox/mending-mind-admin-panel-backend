import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const secret = "mending-mind-admin-panel";

export const signin = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(403).json({
                Status: "failure",
                Error: {
                    message: "User does not exist.",
                name: "ValidationError",
                },
            });
        }

    
    } catch (error) {
        res.status(500).json({
            Status: "failure",
            Error: {
                message: "Internal Server Error.",
                name: "ServerError",
            },
        });
    }
}; 
