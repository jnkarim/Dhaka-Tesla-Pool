import type { NextFunction, Response } from "express";

import prisma from "../lib/prisma.js";

import type { AuthenticatedRequest } from "./authenticate.js";

export async function authorizeAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (!adminEmail) {
      return res.status(500).json({
        success: false,
        message: "Admin email is not configured",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },

      select: {
        email: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.email.trim().toLowerCase() !== adminEmail) {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    next();
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
