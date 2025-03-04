import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/User";
import Organization from "../models/Organization";
import { AuthRequest } from "../middleware/auth";

const secret = "mending-mind-admin-panel";
export const MENDING_MIND_ID = "67c42246019b4349af563057";

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
      { expiresIn: 8 * 60 * 60 }
    );

    res.status(200).json({
      Status: "success",
      Data: {
        user: {
          email: existingUser.email,
          id: existingUser._id,
          role: existingUser.role,
          token,
          ...(existingUser.role === "client" && {
            organizationId: existingUser.organizationId,
          }),
        },
      },
    });
  } catch (error) {
    console.log(error);
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
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Organization does not exist.",
          name: "ValidationError",
        },
      });
    }

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

    const newUser = new User({
      email,
      role,
      status: "pending",
      name,
      phone: phone ? phone : null,
      ...(role === "client" && { organization: organizationId }),
    }) as InstanceType<typeof User>;

    if (role === "therapist") {
      if (MENDING_MIND_ID !== organizationId) {
        const mendingMindOrg = await Organization.findById(MENDING_MIND_ID);
        if (mendingMindOrg) {
          mendingMindOrg.therapists.push(String(newUser._id));
          await mendingMindOrg.save();
        }
      }
      organization.therapists.push(String(newUser._id));
      await organization.save();
    }

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
      { expiresIn: 8 * 60 * 60 }
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const type = (req.query.role as string) || "";

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const organization = await Organization.findById(organizationId);
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
    const queries: any[] = [];

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
      const roles = type.split(",").map((role: string) => role.trim());

      if (roles.includes("therapist")) {
        // Filter users whose _id is in the organization's therapists array
        queries.push({ _id: { $in: organization.therapists } });
      } else {
        queries.push({ role: { $in: roles } });
      }
    }

    // Combine queries if any filters are applied
    const searchQuery = queries.length ? { $and: queries } : {};

    // Get total count for pagination
    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limit);

    // Fetch paginated and filtered users
    const users = await User.find(searchQuery, "email status name _id role")
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
    user.phone = phone ? phone : null;

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

export const clientRegistration = async (req: Request, res: Response) => {
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
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Organization does not exist.",
          name: "ValidationError",
        },
      });
    }

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

    const newUser = new User({
      name,
      email,
      phone,
      password,
      age,
      gender,
      role: "client",
      organization: organizationId,
      status: "active",
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    newUser.password = hashedPassword;

    await newUser.save();

    const token = jwt.sign({ email: newUser.email, id: newUser._id }, secret, {
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
