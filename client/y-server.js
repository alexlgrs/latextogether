import { WebSocketServer } from 'ws';
import http from 'http';

import { setupWSConnection } from '@y/websocket-server/utils';

const port = process.env.PORT || 1234;

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Serveur Yjs opérationnel');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
  console.log('✨ Nouveau collaborateur connecté');
});

server.listen(port, () => {
  console.log(`🚀 Serveur collaboratif lancé sur http://localhost:${port}`);
});