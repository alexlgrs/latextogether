import { Server } from "socket.io";

const io = new Server(4000, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  },
});

io.on("connection", (socket) => {
  console.log("Connecté au client socket:", socket.id);

  socket.on("join-document", (documentId) => {
    socket.join(documentId);
  });

  socket.on("send-changes", ({ documentId, content }) => {
    socket.to(documentId).emit("receive-changes", content);
  });

  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté");
  });
});


export default io;