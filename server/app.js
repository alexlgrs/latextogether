import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import userRoutes from "./routes/UserRoutes";
import authRoutes from "./routes/AuthRoutes"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use(
  express.static(path.join(__dirname, "..", "client", "build"))
);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes)

app.get("/{*any}", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "client", "build", "index.html")
  );
});

export default app;


