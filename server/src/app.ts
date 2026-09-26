import express from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.route.js";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRouter);

// route handler
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dhaka Tesla Pool API is running.",
  });
});

export default app;
