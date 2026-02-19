import app from "./app.js";
import sockets from "./sockets.js"; 
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
