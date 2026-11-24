const http = require('http');
const { WebSocketServer } = require('ws');
const crypto = require('crypto');

const PORT = process.env.PORT || 10000;
const rooms = new Map();
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, service: 'public-test-ptt-signal', rooms: rooms.size }));
  }
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('Public Test PTT signaling server');
});
const wss = new WebSocketServer({ server, maxPayload: 64 * 1024 });

function send(ws, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}
function broadcast(room, data, except) {
  for (const client of room.clients) if (client !== except) send(client, data);
}
function leave(ws) {
  const roomId = ws.roomId;
  if (!roomId) return;
  const room = rooms.get(roomId);
  if (room) {
    if (room.floorHolder === ws) {
      room.floorHolder = null;
      broadcast(room, { type: 'floor-released' });
    }
    room.clients.delete(ws);
    broadcast(room, { type: 'peer-left', peerId: ws.clientId });
    if (room.clients.size === 0) rooms.delete(roomId);
  }
  ws.roomId = null;
}
wss.on('connection', (ws) => {
  ws.clientId = crypto.randomUUID();
  ws.roomId = null;
  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return send(ws, { type: 'error', message: 'Invalid message' }); }
    if (!msg || typeof msg.type !== 'string') return;
    if (msg.type === 'join') {
      const roomId = String(msg.roomId || '').trim().slice(0, 80);
      if (!/^[a-zA-Z0-9_-]{3,80}$/.test(roomId)) return send(ws, { type: 'error', message: 'Invalid channel ID' });
      leave(ws);
      let room = rooms.get(roomId);
      if (!room) { room = { clients: new Set(), floorHolder: null }; rooms.set(roomId, room); }
      if (room.clients.size >= 8) return send(ws, { type: 'error', message: 'This test channel is full (8 people maximum)' });
      const peers = [...room.clients].map(c => ({ id: c.clientId }));
      room.clients.add(ws);
      ws.roomId = roomId;
      send(ws, { type: 'joined', clientId: ws.clientId, roomId, peers });
      broadcast(room, { type: 'peer-joined', peerId: ws.clientId }, ws);
      return;
    }
    const room = ws.roomId && rooms.get(ws.roomId);
    if (!room || !room.clients.has(ws)) return;
    if (msg.type === 'offer' || msg.type === 'answer' || msg.type === 'ice') {
      const target = [...room.clients].find(c => c.clientId === msg.to);
      if (target) send(target, { ...msg, from: ws.clientId });
    } else if (msg.type === 'floor-request') {
      if (!room.floorHolder) {
        room.floorHolder = ws;
        broadcast(room, { type: 'floor-granted', peerId: ws.clientId });
      } else if (room.floorHolder !== ws) {
        send(ws, { type: 'floor-denied' });
      }
    } else if (msg.type === 'floor-release') {
      if (room.floorHolder === ws) {
        room.floorHolder = null;
        broadcast(room, { type: 'floor-released' });
      }
    } else if (msg.type === 'leave') {
      leave(ws);
    }
  });
  ws.on('close', () => leave(ws));
  ws.on('error', () => leave(ws));
});
server.listen(PORT, '0.0.0.0', () => console.log('Public Test signaling server listening on ' + PORT));
