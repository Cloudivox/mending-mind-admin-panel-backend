import { Response } from "express";
import Organization from "../models/Organization";
import { AuthRequest } from "../middleware/auth";
import User from "../models/User";

export const getAllOrganizations = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "User does not exist.",
          name: "ValidationError",
        },
      });
    }

    let organizations;
    if (user.role === "admin") {
      organizations = await Organization.find({});
    } else if (user.role === "therapist") {
      organizations = await Organization.find({ therapists: userId });
    } else {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Unauthorized access.",
          name: "UnauthorizedError",
        },
      });
    }

    // Convert therapist IDs to objects with { id, name }
    const organizationsWithTherapists = await Promise.all(
      organizations.map(async (org) => {
        // Fetch therapist details
        const therapists = await User.find(
          { _id: { $in: org.therapists } },
          { _id: 1, name: 1 }
        ).lean();

        const clientCount = await User.countDocuments({
          organizationId: org.id,
          role: "client",
        });

        // Format therapists array
        const formattedTherapists = therapists.map((therapist) => ({
          _id: therapist._id.toString(),
          name: therapist.name,
        }));

        return {
          ...org.toObject(),
          therapists: formattedTherapists,
          users: clientCount,
        };
      })
    );

    return res
      .status(200)
      .json({ Status: "success", Data: organizationsWithTherapists });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal server error.",
        name: "InternalServerError",
      },
    });
  }
};

export const createOrganization = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const { name, location, code, country, description, logo, therapists } =
    req.body;

  if (!name || !location || !code || !country || !therapists) {
    return res.status(400).json({
      Status: "failure",
      Error: {
        message: "All fields are required.",
        name: "ValidationError",
      },
    });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "User does not exist.",
          name: "ValidationError",
        },
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Only admin can create an organization.",
          name: "AuthorizationError",
        },
      });
    }

    const organization = await Organization.create({
      name,
      location,
      code,
      country,
      description,
      logo,
      status: "active",
      createdAt: new Date().toISOString(),
      createdBy: userId,
      therapists,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    });

    return res.status(200).json({ Status: "success", Data: organization });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal server error.",
        name: "InternalServerError",
      },
    });
  }
};

export const verifyCode = async (req: AuthRequest, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({
      Status: "failure",
      Error: {
        message: "Code is required.",
        name: "ValidationError",
      },
    });
  }

  try {
    const organization = await Organization.findOne({ code });

    if (!organization) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Organization does not exist.",
          name: "ValidationError",
        },
      });
    }

    return res.status(200).json({
      Status: "success",
      Data: {
        message: "Organization verified successfully.",
        organization,
      },
    });
  } catch (error) {
    res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal server error.",
        name: "InternalServerError",
      },
    });
  }
};

export const getDetailsByCode = async (req: AuthRequest, res: Response) => {
  const { code } = req.params;
  if (!code) {
    return res.status(400).json({
      Status: "failure",
      Error: {
        message: "Code is required.",
        name: "ValidationError",
      },
    });
  }
  try {
    const organization = await Organization.findOne({ code });
    if (!organization) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Organization does not exist.",
          name: "ValidationError",
        },
      });
    }
    return res.status(200).json({ Status: "success", Data: organization });
  } catch (error) {
    res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal server error.",
        name: "InternalServerError",
      },
    });
  }
};
