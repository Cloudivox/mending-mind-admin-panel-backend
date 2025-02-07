import { Request, Response } from "express";
import User from "../models/User";
import Profile from "../models/Profile";

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const {
      bio,
      qualification,
      specialization,
      experience,
      phone,
      userId,
      name,
      email,
    } = req.body;

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

    if (name || email) {
      if (name !== user.name || email !== user.email) {
        user.name = name;
        user.email = email;
        await user.save();
      }
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      const newProfile = new Profile({
        bio,
        qualification,
        specialization,
        experience,
        phone,
        userId,
      });
      await newProfile.save();
    } else {
      profile.bio = bio;
      profile.qualification = qualification;
      profile.specialization = specialization;
      profile.experience = experience;
      profile.phone = phone;
      await profile.save();
    }

    return res.status(200).json({
      Status: "success",
      Message: "Profile updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal Server Error.",
        name: "ServerError",
      },
    });
  }
};
