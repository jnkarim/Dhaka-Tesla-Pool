import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./modules/auth/auth.route.js";
import rideRouter from "./modules/rides/ride.route.js";
import poolRouter from "./modules/pools/pool.route.js";
import vehicleRouter from "./modules/vehicles/vehicle.route.js";
import driverRouter from "./modules/drivers/driver.route.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/rides", rideRouter);
app.use("/api/v1/pools", poolRouter);
app.use("/api/v1/vehicles", vehicleRouter);
app.use("/api/v1/drivers", driverRouter);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dhaka Tesla Pool API is running.",
  });
});

export default app;
