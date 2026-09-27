import express from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.route.js";
import rideRouter from "./modules/rides/ride.route.js";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/rides", rideRouter);

// route handler
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dhaka Tesla Pool API is running.",
  });
});

export default app;
