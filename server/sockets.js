import { Server } from "socket.io";
import { Document } from "./models/Document.js";

export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
        origin: "*",
        methods: ["GET", "POST"]
        },
    });

    const pendingChanges = new Map();
    const documentUsers = new Map();

    io.on("connection", (socket) => {
        console.log("Connecté au client socket:", socket.id);

        socket.on("join-document", ({ documentId, username }) => {
            socket.join(documentId);
            
            if (!documentUsers.has(documentId)) documentUsers.set(documentId, []);

            documentUsers.get(documentId).push({ socketId: socket.id, username });
            
            console.log(`Utilisateur ${username} (${socket.id}) a rejoint : ${documentId}`);
            

            io.to(documentId).emit("users-in-document", documentUsers.get(documentId));
        });

        socket.on("send-changes", async ({ documentId, content }) => {

            try {
                socket.to(documentId).emit("receive-changes", content);
                
                if (pendingChanges.has(documentId)) clearTimeout(pendingChanges.get(documentId).timer);

                const timer = setTimeout(async () => {
                    await Document.findByIdAndUpdate(documentId, { 
                        content: content,
                        updatedAt: new Date()
                    });
                    pendingChanges.delete(documentId);
                    console.log(`Document ${documentId} sauvegardé`);
                }, 500);

                pendingChanges.set(documentId, { timer, content });
            } catch (error) {
                console.error("Erreur lors de la synchronisation:", error);
            }
        });

        socket.on("disconnect", () => {
            // retirer l'utilisateur des listes des documents
            documentUsers.forEach((users, documentId) => {
                const userIndex = users.findIndex(u => u.socketId === socket.id);
                if (userIndex !== -1) {
                users.splice(userIndex, 1);
                io.to(documentId).emit("users-in-document", users);
                console.log(`Utilisateur disconnecté du document ${documentId}`);
                }
            });
            console.log("Utilisateur déconnecté");
        });
    }); 

    return io;
};