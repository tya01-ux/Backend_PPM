import express from "express";
import cors from "cors";

// `import` statements for routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courtRoutes from "./routes/courtRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); 

app.get("/", (req, res) => {
  res.send("Hello PPM!");
});

//  import dan gunakan routes
app.use("/courts", courtRoutes);
app.use("/bookings", bookingRoutes);
app.use("/memberships", membershipRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

