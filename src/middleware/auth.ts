import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";

const secret = "mending-mind-admin-panel";

interface AuthRequest extends Request {
  user_Id?: string | JwtPayload;
}

interface ErrorResponse {
  Status: string;
  Error: {
    message: string;
    name: string;
    code: string;
  };
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = typeof req.headers["accesstoken"] === 'string' ? req.headers["accesstoken"].split(" ")[1] : undefined;

    if (!token) {
      const errorResponse: ErrorResponse = {
        Status: "failure",
        Error: {
          message: "Unauthorized. No token provided.",
          name: "AuthenticationError",
          code: "EX-00103",
        },
      };
      return res.status(405).json(errorResponse);
    }

    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== 'string' && 'id' in decoded) {
      req.user_Id = decoded.id; // Attach user ID to request
    }
    next();
  } catch (error) {
    const errorResponse: ErrorResponse = {
      Status: "failure",
      Error: {
        message: "Invalid or expired token.",
        name: "AuthenticationError",
        code: "EX-00105",
      },
    };
    res.status(405).json(errorResponse);
  }
};

export default auth;