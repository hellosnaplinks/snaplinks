const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const peerServer = ExpressPeerServer(server, {
  path: '/'
});
app.use('/peerjs', peerServer);

// In-memory store for rooms
// Key: 6-digit PIN, Value: { hostSocketId: string, peerId: string, createdAt: number }
const rooms = new Map();

// Generate a unique 6-digit PIN
function generatePIN() {
  let pin;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(pin));
  return pin;
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Host creates a room
  socket.on('create-room', ({ peerId, existingPin }, callback) => {
    const pin = existingPin || generatePIN();
    rooms.set(pin, {
      hostSocketId: socket.id,
      peerId: peerId, // Host's PeerJS ID
      createdAt: Date.now()
    });
    
    socket.join(pin);
    console.log(`Room ${pin} created by ${socket.id} (PeerID: ${peerId})`);
    
    if (callback) {
      callback({ success: true, pin });
    }
  });

  // Guest joins a room
  socket.on('join-room', ({ pin, peerId }, callback) => {
    const room = rooms.get(pin);
    if (room) {
      socket.join(pin);
      console.log(`User ${socket.id} (PeerID: ${peerId}) joined room ${pin}`);
      
      // Notify the host that a guest is joining, providing the guest's PeerJS ID
      // so they can initiate the connection (or vice-versa, PeerJS makes it easy).
      // Actually, with PeerJS, the guest can just connect to the host's peerId directly!
      
      if (callback) {
        callback({ success: true, hostPeerId: room.peerId });
      }

      // We can also notify the host
      socket.to(room.hostSocketId).emit('guest-joined', { guestPeerId: peerId });

      // After successful exchange, we can delete the room from signaling server 
      // as they will use WebRTC DataChannels directly.
      // Let's delay deletion slightly to allow connection to establish
      setTimeout(() => {
        rooms.delete(pin);
        console.log(`Room ${pin} removed from signaling server.`);
      }, 5000);

    } else {
      if (callback) callback({ success: false, error: 'Invalid PIN or room expired' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    // Cleanup any rooms hosted by this socket
    for (const [pin, room] of rooms.entries()) {
      if (room.hostSocketId === socket.id) {
        rooms.delete(pin);
        console.log(`Room ${pin} deleted due to host disconnect.`);
      }
    }
  });
});

// Periodic cleanup of stale rooms (e.g., older than 1 hour if not joined)
setInterval(() => {
  const now = Date.now();
  for (const [pin, room] of rooms.entries()) {
    if (now - room.createdAt > 3600000) { // 1 hour
      rooms.delete(pin);
      console.log(`Cleaned up stale room ${pin}`);
    }
  }
}, 600000); // Check every 10 mins

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
