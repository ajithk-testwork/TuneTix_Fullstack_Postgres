import express from "express";
import dotenv from "dotenv";
import prisma from "./config/prisma";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import seatCategoryRoutes from "./routes/seatCategoryRoutes";
import seatRoutes from "./routes/seatRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import http from "http";
import { initializeSocket } from "./socket";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://tune-tix-fullstack-postgres-kszh.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
     
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);



app.use(
  "/api/payment/webhook",
  express.raw({
    type: "application/json",
  }),
);



app.use(express.json());

app.use(express.urlencoded({ extended: true }));



app.use("/api", authRoutes);
app.use("/api", eventRoutes);
app.use("/api", seatCategoryRoutes);
app.use("/api", seatRoutes);
app.use("/api", bookingRoutes);
app.use("/api", paymentRoutes);


async function startServer() {
  try {
    await prisma.$connect();

    console.log("✅ PostgreSql Connected Successfully");

    const server = http.createServer(app);

    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🔌 Socket.IO running`);
    });
  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
  }
}

startServer();
