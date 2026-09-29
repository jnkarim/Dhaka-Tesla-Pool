import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.js";

import {
  loginUser,
  registerUser,
} from "./auth.service.js";

// Register

export const register = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (
      role !== "PASSENGER" &&
      role !== "DRIVER"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const user = await registerUser({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "UNKNOWN_ERROR";

    if (
      message === "Email already used." ||
      message === "Email already exists"
    ) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login

export const login = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await loginUser({
      email,
      password,
    });

    res.cookie("token", result.token, {
      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",

      maxAge:
        7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,

      data: {
        user: result.user,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "UNKNOWN_ERROR";

    if (message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (message === "JWT_SECRET_MISSING") {
      console.error(
        "JWT_SECRET is not configured.",
      );

      return res.status(500).json({
        success: false,
        message:
          "Authentication configuration error",
      });
    }

    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Logout

export const logout = (
  req: Request,
  res: Response,
) => {
  res.clearCookie("token", {
    httpOnly: true,

    secure:
      process.env.NODE_ENV === "production",

    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Current authenticated user

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  return res.status(200).json({
    success: true,
    data: req.user,
  });
};