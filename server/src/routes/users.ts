import { Router } from "express";
import { User } from "../models/index.js";
import { Types } from "mongoose";
import type { RequestHandler } from "express";

const router = Router();

interface UserParams {
  id: string;
}

interface UserBody {
  name: string;
  email: string;
  avatar?: string;
}

type EmptyParams = Record<string, never>;

// GET /api/users - Get all users
const getAllUsers: RequestHandler = async (_req, res, next) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id - Get a specific user
const getUserById: RequestHandler<UserParams> = async (req, res, next) => {
  try {
    const user = await User.findById(new Types.ObjectId(req.params.id));
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// POST /api/users - Create a new user
const createUser: RequestHandler<EmptyParams, unknown, UserBody> = async (
  req,
  res,
  next
) => {
  try {
    const { name, email, avatar } = req.body;

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res
        .status(400)
        .json({ success: false, error: "User with this email already exists" });
      return;
    }

    const newUser = new User({
      name,
      email,
      avatar,
    });

    await newUser.save();
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id - Update a user
const updateUser: RequestHandler<UserParams, unknown, UserBody> = async (
  req,
  res,
  next
) => {
  try {
    const { name, email, avatar } = req.body;

    // If email is being changed, check if new email already exists
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: new Types.ObjectId(req.params.id) },
      });
      if (existingUser) {
        res
          .status(400)
          .json({
            success: false,
            error: "User with this email already exists",
          });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      new Types.ObjectId(req.params.id),
      {
        name,
        email,
        avatar,
      },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id - Delete a user
const deleteUser: RequestHandler<UserParams> = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(
      new Types.ObjectId(req.params.id)
    );
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Mount routes with explicit type assertions
router.get("/", getAllUsers as RequestHandler);
router.get("/:id", getUserById as RequestHandler<UserParams>);
router.post("/", createUser as RequestHandler<EmptyParams, unknown, UserBody>);
router.put("/:id", updateUser as RequestHandler<UserParams, unknown, UserBody>);
router.delete("/:id", deleteUser as RequestHandler<UserParams>);

export default router;
