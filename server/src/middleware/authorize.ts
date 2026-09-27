import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./authenticate.js";

type UserRole = "PASSENGER" | "DRIVER";

export const authorize = (...allowedRoles: UserRole[]){

}