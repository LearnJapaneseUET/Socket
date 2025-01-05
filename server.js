const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow any origin for testing
        methods: ['GET', 'POST']
    }
});

let users = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Event: New user joined
    socket.on('join', (username) => {
        users[socket.id] = username;
        socket.broadcast.emit('user-connected', username);
        console.log(`${username} joined the chat.`);
    });

    // Event: Send message
    socket.on('send-message', (message) => {
        const username = users[socket.id];
        io.emit('receive-message', { username, message });
    });

    // Event: Disconnect
    socket.on('disconnect', () => {
        const username = users[socket.id];
        delete users[socket.id];
        socket.broadcast.emit('user-disconnected', username);
        console.log(`${username} left the chat.`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
