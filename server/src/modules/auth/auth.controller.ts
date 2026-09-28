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
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    console.log("LOGIN BODY:", {
      email,
      password,
    });

    const result = await loginUser({
      email,
      password,
    });

    console.log("LOGIN RESULT:", result);


    res.cookie("token", result.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    return res.status(200).json({
      success: true,
      data: {
        user: result.user,
      },
    });

  } catch (error: any) {

    console.log("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = (
  req: Request,
  res: Response,
) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });


  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};
