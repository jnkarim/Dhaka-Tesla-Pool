import type { Request, Response } from "express";
import { loginUser, registerUser } from "./auth.service.js";
import type { AuthenticatedRequest } from "../../middleware/authenticate.js";

// Register
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // service call
    const user = await registerUser({
      name,
      email,
      password,
      role,
    });

    // response back to browser
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error instanceof Error && error.message === "Email already exists") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        messages: "Email and password are required",
      });
    }

    // call service
    const result = await loginUser({
      email,
      password,
    });
  } catch (error: any) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};
