import express from "express";
import cors from "cors";

// union type
type RideStatus =
  | "REQUESTED"
  | "MATHCED"
  | "DRIVER_ARRIVED"
  | "STARTED"
  | "COMPLETED"
  | "CANCELLED";
const app = express();

// middlewares
app.use(cors());
app.use(express.json());

type Ride = {
  id: Number;
  passengerName: string;
  pickup: string;
  destination: string;
  seats: string;
  status: RideStatus;
};

const rides: Ride[] = [];

// route handler
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dhaka Tesla Pool API is running.",
  });
});

app.post("/api/v1/rides", (req, res) => {
  const { passengerName, pickup, destination, seats } = req.body;

  if (!passengerName || !pickup || !destination || !seats) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (!passengerName || !pickup || !destination || !seats) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (pickup === destination) {
    return res.status(400).json({
      success: false,
      message: "Pickup and destination must be different",
    });
  }

  const newRide: Ride = {
    id: rides.length + 1,
    passengerName,
    pickup,
    destination,
    seats,
    status: "REQUESTED",
  };

  rides.push(newRide);

  return res.status(201).json({
    success: true,
    data: newRide,
  });
});

app.get("/api/v1/rides", (req, res) => {
  return res.status(200).json({
    success: true,
    data: rides,
  });
});

app.get("/api/v1/rides/:id", (req, res) => {
  const rideId = Number(req.params.id);

  const ride = rides.find((ride) => ride.id === rideId);

  if (!ride) {
    return res.status(404).json({
      success: false,
      message: "Ride not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: ride,
  });
});

app.patch("/api/v1/rides/:id/cancel", (req, res) => {
  const rideId = Number(req.params.id);

  const ride = rides.find((ride) => ride.id === rideId);

  if (!ride) {
    return res.status(404).json({
      success: false,
      message: "Ride not found",
    });
  }

  if (ride.status === "COMPLETED") {
    return res.status(400).json({
      success: false,
      message: "Completed ride cannot be cancelled",
    });
  }

  ride.status = "CANCELLED";

  return res.status(200).json({
    success: true,
    data: ride,
  });
});

export default app;
