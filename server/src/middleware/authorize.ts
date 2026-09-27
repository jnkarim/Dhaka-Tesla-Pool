import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./authenticate.js";

export const authorizeDriver = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "DRIVER") {
    return res.status(403).json({
      success: false,
      message: "Driver access only",
    });
  }

  next();
};
