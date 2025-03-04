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
    console.log(user);

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
      if (name !== user.name || email !== user.email || phone !== user.phone) {
        user.name = name;
        user.email = email;
        user.phone = phone;
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
        userId,
        age: user.age,
        gender: user.gender,
      });
      await newProfile.save();
    } else {
      profile.bio = bio;
      profile.qualification = qualification;
      profile.specialization = specialization;
      profile.experience = experience;
      profile.age = user.age;
      profile.gender = user.gender;
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

export const getProfileDetails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        Status: "failure",
        Error: {
          message: "User ID is required.",
          name: "ValidationError",
        },
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(403).json({
        Status: "failure",
        Error: {
          message: "User does not exist.",
          name: "NotFoundError",
        },
      });
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(200).json({
        Status: "success",
        Message: "Profile not found, returning user details.",
        Data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          age: user.age,
          gender: user.gender,
        },
      });
    }

    return res.status(200).json({
      Status: "success",
      Data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: profile.bio,
        qualification: profile.qualification,
        specialization: profile.specialization,
        experience: profile.experience,
        age: user.age,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      Status: "failure",
      Error: {
        message: "Internal Server Error.",
        name: "ServerError",
      },
    });
  }
};
