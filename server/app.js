import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import userRoutes from "./routes/UserRoutes.js";
import authRoutes from "./routes/AuthRoutes.js";
import latexRoutes from "./routes/LatexRoutes.js";
import projectRoutes from "./routes/ProjectRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/temp", express.static(path.join(__dirname, "temp")));

app.use(express.static(path.join(__dirname, "..", "client", "dist")));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/latex", latexRoutes);
app.use("/api/projects", projectRoutes);

app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
});

export default app;