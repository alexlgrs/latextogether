import http from "http"; // Ajoute cet import
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./sockets.js"; // On va changer l'import ici

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

initSocket(server); 

connectDB();

server.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});