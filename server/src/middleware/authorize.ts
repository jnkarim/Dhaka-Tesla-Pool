import type {
  NextFunction,
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "./authenticate.js";


export const authorize = (
  role: "PASSENGER" | "DRIVER",
) => {
  return (
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


    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }


    next();
  };
};