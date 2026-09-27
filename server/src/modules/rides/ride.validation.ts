import { z } from "zod";

export const createRideSchema = z.object({
  pickup: z.string(),

  destination: z.string(),

  seats: z.number().min(1),
});
