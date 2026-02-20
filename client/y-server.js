import { WebSocketServer } from 'ws';
import http from 'http';
import { createRequire } from 'module';

// On recrée la fonction "require" car elle n'existe pas par défaut en ESM
const require = createRequire(import.meta.url);

// On récupère la logique serveur de y-websocket
const { setupWSConnection } = require('./node_modules/y-websocket/dist/y-websocket.cjs');

const port = process.env.PORT || 1234;

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Serveur Yjs opérationnel');
});

// Création du serveur WebSocket
const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
  // Cette fonction gère la synchro magique entre les clients
  setupWSConnection(conn, req);
  console.log('✨ Nouveau collaborateur connecté');
});

server.listen(port, () => {
  console.log(`🚀 Serveur collaboratif lancé sur http://localhost:${port}`);
  console.log(`Prêt pour le travail à deux !`);
});