import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courtRoutes from "./routes/courtRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import promoRoutes from "./routes/promoRoutes.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.get("/", (req, res) => {
    res.send("PUMA Badminton Hall API 🏸");
});
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/courts", courtRoutes);
app.use("/bookings", bookingRoutes);
app.use("/memberships", membershipRoutes);
app.use("/payments", paymentRoutes);
app.use("/promos", promoRoutes);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map