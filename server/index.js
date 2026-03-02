import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

connectDB();

server.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});