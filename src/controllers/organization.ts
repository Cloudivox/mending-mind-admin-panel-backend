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

export const updateOrganization = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const { id, name, location, code, country, description, logo, therapists } =
    req.body;

  if (!id) {
    return res.status(400).json({
      Status: "failure",
      Error: {
        message: "Organization ID is required.",
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
          message: "Only admin can update an organization.",
          name: "AuthorizationError",
        },
      });
    }

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Organization not found.",
          name: "NotFoundError",
        },
      });
    }

    const updatedFields = {
      ...(name && { name }),
      ...(location && { location }),
      ...(code && { code }),
      ...(country && { country }),
      ...(description && { description }),
      ...(logo ? { logo } : { logo: null }),
      ...(therapists && { therapists }),
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    const updatedOrganization = await Organization.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true }
    );

    return res
      .status(200)
      .json({ Status: "success", Data: updatedOrganization });
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

export const deleteOrganization = async (req: AuthRequest, res: Response) => {
  const userId = req.user_Id;
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      Status: "failure",
      Error: {
        message: "Organization ID is required.",
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
          message: "Only admin can delete an organization.",
          name: "AuthorizationError",
        },
      });
    }

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "Organization not found.",
          name: "NotFoundError",
        },
      });
    }

    await Organization.findByIdAndDelete(id);

    return res.status(200).json({
      Status: "success",
      Message: "Organization deleted successfully.",
    });
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

export const deleteTherapistFromOrganization = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user_Id;
  const { organizationId, therapistId } = req.params;

  try {
    // Check if user is an admin
    const user = await User.findById(userId).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        status: "failure",
        error: {
          message: "Only an admin can remove a therapist.",
          name: "ValidationError",
        },
      });
    }

    // Find the organization
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(403).json({
        status: "failure",
        error: {
          message: "Organization not found.",
          name: "NotFoundError",
        },
      });
    }

    // Check if therapistId exists in the organization's therapists array
    if (!organization.therapists.includes(therapistId)) {
      return res.status(400).json({
        status: "failure",
        error: {
          message: "Therapist is not associated with this organization.",
          name: "ValidationError",
        },
      });
    }

    // Remove therapistId from therapists array
    organization.therapists = organization.therapists.filter(
      (id) => id.toString() !== therapistId
    );

    // Save the updated organization
    await organization.save();

    return res.status(200).json({
      status: "success",
      message: "Therapist removed successfully.",
      organization,
    });
  } catch (error) {
    console.error("Error removing therapist:", error);
    return res.status(500).json({
      status: "failure",
      error: {
        message: "Internal Server Error",
        name: "ServerError",
      },
    });
  }
};

export const addTherapistInOrganization = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user_Id; // Authenticated admin's ID
  const { organizationId } = req.params;
  const { therapistIds } = req.body; // Array of therapist IDs

  try {
    // Validate input
    if (!Array.isArray(therapistIds) || therapistIds.length === 0) {
      return res.status(400).json({
        status: "failure",
        error: {
          message: "Therapist IDs must be provided as a non-empty array.",
          name: "ValidationError",
        },
      });
    }

    // Check if the user is an admin
    const user = await User.findById(userId).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        status: "failure",
        error: {
          message: "Only an admin can add therapists.",
          name: "ValidationError",
        },
      });
    }

    // Find the organization
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(403).json({
        status: "failure",
        error: {
          message: "Organization not found.",
          name: "NotFoundError",
        },
      });
    }

    // Get therapist users from the database
    const validTherapists = await User.find({
      _id: { $in: therapistIds },
      role: "therapist",
    }).select("_id");

    // Extract valid therapist IDs
    const validTherapistIds = validTherapists.map((therapist) =>
      String(therapist._id)
    );

    // Find invalid therapist IDs
    const invalidTherapistIds = therapistIds.filter(
      (id) => !validTherapistIds.includes(id)
    );
    if (invalidTherapistIds.length > 0) {
      return res.status(400).json({
        status: "failure",
        error: {
          message:
            "Some provided therapist IDs are invalid or do not belong to therapists.",
          invalidIds: invalidTherapistIds,
          name: "ValidationError",
        },
      });
    }

    // Remove duplicates: Only add new therapists
    const newTherapists = validTherapistIds.filter(
      (id) => !organization.therapists.includes(id)
    );
    if (newTherapists.length === 0) {
      return res.status(400).json({
        status: "failure",
        error: {
          message:
            "All therapists are already associated with this organization.",
          name: "ValidationError",
        },
      });
    }

    // Append new therapists to the organization
    organization.therapists.push(...newTherapists);

    // Save the updated organization
    await organization.save();

    return res.status(200).json({
      status: "success",
      message: "Therapists added successfully.",
      addedTherapists: newTherapists,
      organization,
    });
  } catch (error) {
    console.error("Error adding therapists:", error);
    return res.status(500).json({
      status: "failure",
      error: {
        message: "Internal Server Error",
        name: "ServerError",
      },
    });
  }
};
