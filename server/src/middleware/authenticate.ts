import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

type TokenPayload = {
  userId: string;
  role: "PASSENGER" | "DRIVER";
};

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  // Read token from cookie first
  let token = req.cookies?.token;

  // Support Authorization header also
  if (!token) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const [scheme, headerToken] = authHeader.split(" ");

      if (scheme === "Bearer" && headerToken) {
        token = headerToken;
      }
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      message: "Server authentication configuration error",
    });
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as TokenPayload;

    req.user = payload;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
