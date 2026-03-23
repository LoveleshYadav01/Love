const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e8 // 100 MB max for image sharing
});

// Setup SQLite for user credentials
const db = new sqlite3.Database(path.join(__dirname, 'users.db'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
});

// Session middleware
const sessionMiddleware = session({
  secret: 'super-secret-ephemeral-key',
  resave: false,
  saveUninitialized: false
});

app.use(express.static(__dirname));
app.use(express.json());
app.use(sessionMiddleware);

// Share session with Socket.io
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next);
});

// Auth Routes API
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const hash = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], function(err) {
    if (err) return res.status(400).json({ error: 'Username already exists' });
    req.session.userId = this.lastID;
    req.session.username = username;
    res.json({ success: true, username });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
    if (err || !row || !bcrypt.compareSync(password, row.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.userId = row.id;
    req.session.username = row.username;
    res.json({ success: true, username });
  });
});

app.post('/api/logout', (req, res) => {
  const username = req.session.username;
  req.session.destroy(() => {
    // Force disconnect related sockets
    for (let [id, socket] of io.sockets.sockets) {
      if (socket.request.session && socket.request.session.username === username) {
        socket.disconnect(true);
      }
    }
    res.json({ success: true });
  });
});

app.get('/api/me', (req, res) => {
  if (req.session.userId) {
    return res.json({ username: req.session.username });
  }
  res.status(401).json({ error: 'Not logged in' });
});

// --- EPHEMERAL IN-MEMORY CHAT ---
// Store rooms in RAM only.
// rooms = { 'room123': { password: 'pass', users: [ {socketId, username} ] } }
const rooms = {};

io.on('connection', (socket) => {
  const session = socket.request.session;
  if (!session || !session.username) {
    return socket.disconnect(true);
  }
  const username = session.username;
  let currentRoom = null;

  socket.on('joinRoom', ({ roomId, roomPassword }, callback) => {
    if (!roomId) return callback({ error: 'Room ID is required' });

    // Handle room creation / fetching
    if (!rooms[roomId]) {
      rooms[roomId] = { password: roomPassword, users: [] };
    } else {
      if (rooms[roomId].password && rooms[roomId].password !== roomPassword) {
        return callback({ error: 'Invalid room password' });
      }
      if (rooms[roomId].users.length >= 2) {
        return callback({ error: 'Room is full (max 2 users array)' });
      }
    }

    // Join socket room and our manual tracker
    socket.join(roomId);
    currentRoom = roomId;
    rooms[roomId].users.push({ socketId: socket.id, username });
    
    // Notify room
    socket.to(roomId).emit('userJoined', { username });
    callback({ success: true, users: rooms[roomId].users.map(u => u.username) });
  });

  socket.on('chatMessage', (data) => {
    if (currentRoom) {
      // Broadcast to room
      socket.to(currentRoom).emit('chatMessage', {
        id: data.id, 
        text: data.text, 
        username, 
        time: data.time 
      });
    }
  });

  socket.on('mediaShare', (data) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('mediaShare', {
        id: data.id,
        file: data.file,
        isVid: data.isVid,
        username,
        time: data.time
      });
    }
  });

  socket.on('deleteForEveryone', (msgId) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('messageDeleted', msgId);
    }
  });

  socket.on('gameEvent', (data) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('gameEvent', data);
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      const room = rooms[currentRoom];
      room.users = room.users.filter(u => u.socketId !== socket.id);
      socket.to(currentRoom).emit('userLeft', { username });

      // If room becomes empty, delete it from memory permanently
      if (room.users.length === 0) {
        delete rooms[currentRoom];
      }
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(\`Ephemeral Chat Server running on http://localhost:\${PORT}\`));
