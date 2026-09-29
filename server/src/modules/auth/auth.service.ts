import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "../../lib/prisma.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: "PASSENGER" | "DRIVER";
};

type LoginInput = {
  email: string;
  password: string;
};

// Register

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new Error("Email already used.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
      },
    });

    if (input.role === "DRIVER") {
      await tx.vehicle.create({
        data: {
          name: `${input.name}'s Tesla`,

          plateNumber: `DTP-${createdUser.id.slice(-8).toUpperCase()}`,

          capacity: 3,

          isOnline: false,

          driverId: createdUser.id,
        },
      });
    }

    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      createdAt: createdUser.createdAt,
    };
  });

  return user;
};

// Login

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET_MISSING");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: "7d",
    },
  );

  return {
    token,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
