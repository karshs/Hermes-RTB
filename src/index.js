require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./config/db');
const redis = require('./config/redis'); // add this
const auctionRoutes = require('./routes/auction.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server (Socket.io needs this)
const server = http.createServer(app);

// Attach Socket.io to the HTTP server
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(express.json());
app.use(express.static('src/public'));
app.use('/auth', authRoutes);
app.use('/auctions', auctionRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Hermes-RTB is alive!',
        environment: process.env.NODE_ENV
    });
});

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    // User joins an auction room
    socket.on('join_auction', (auctionId) => {
        socket.join(`auction_${auctionId}`);
        console.log(`User ${socket.id} joined auction_${auctionId}`);
    });

    // User leaves
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Make io accessible in controllers
app.set('io', io);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});