import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

const secret = "mending-mind-admin-panel";

export const signin = async (req: Request, res: Response) => {
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

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Invalid credentials.",
          name: "ValidationError",
        },
      });
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      secret,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      Status: "success",
      Data: {
        user: {
          email: existingUser.email,
          id: existingUser._id,
          role: existingUser.role,
          token,
        },
      },
    });
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

// **Create User**
export const createUser = async (req: Request, res: Response) => {
  const { email, role, name } = req.body;

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
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "User already exists.",
          name: "ValidationError",
        },
      });
    }

    const newUser = new User({ email, role, status: "pending", name });
    await newUser.save();

    res.status(201).json({
      Status: "success",
      Data: { user: newUser },
    });
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

// **Signup**
export const signup = async (req: Request, res: Response) => {
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
    const existingUser = await User.findOne({ email });

    if (!existingUser || existingUser.status !== "pending") {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "User does not exist or is already active.",
          name: "ValidationError",
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword, status: "active" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json({
        Status: "failure",
        Error: {
          message: "User update failed.",
          name: "ServerError",
        },
      });
    }

    const token = jwt.sign(
      { email: updatedUser.email, id: updatedUser._id },
      secret,
      { expiresIn: "8h" }
    );

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

export const getUserDetails = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user_Id);
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

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Create search query
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get total count for pagination
    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limit);

    // Fetch paginated and filtered users
    const users = await User.find(searchQuery, "email status name _id role")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!users || users.length === 0) {
      return res.status(200).json({
        Status: "success",
        Data: {
          users: [],
          pagination: {
            totalUsers: 0,
            totalPages: 0,
            currentPage: page,
            limit,
          },
        },
      });
    }

    res.status(200).json({
      Status: "success",
      Data: {
        users,
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          limit,
        },
      },
    });
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

export const updateUser = async (req: Request, res: Response) => {
  const { _id, email, role, name } = req.body;

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
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({
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

    await user.save();

    res.status(200).json({
      Status: "success",
      Data: user,
    });
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

export const deleteUser = async (req: Request, res: Response) => {
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
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({
        Status: "failure",
        Error: {
          message: "User does not exist.",
          name: "NotFoundError",
        },
      });
    }

    await user.deleteOne();

    res.status(200).json({
      Status: "success",
      Data: {
        message: "User deleted successfully.",
      },
    });
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

export const getAllTherapist = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  try {
    const isAdmin = await User.findById(userId);
    if (!isAdmin) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Only admin can get all therapists.",
          name: "ValidationError",
        },
      });
    }
    const therapists = await User.find(
      { role: "therapist", status: "active" },
      "email name id"
    );

    res.status(200).json({
      Status: "success",
      Data: {
        therapists,
      },
    });
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
