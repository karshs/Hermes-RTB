require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const pool = require('./config/db');
const redis = require('./config/redis');
const auctionRoutes = require('./routes/auction.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Create HTTP server (Socket.io needs this)
const server = http.createServer(app);

// Attach Socket.io to the HTTP server
const io = new Server(server, {
    cors: {
        origin: isProd ? false : '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// API routes
app.use('/auth', authRoutes);
app.use('/auctions', auctionRoutes);

if (isProd) {
    // Serve the built React app
    const distPath = path.join(__dirname, 'public', 'dist');
    app.use(express.static(distPath));

    // All non-API routes go to React's index.html (client-side routing)
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    // In dev, just confirm the API is alive
    app.get('/', (req, res) => {
        res.json({
            message: 'Hermes-RTB API is alive!',
            environment: process.env.NODE_ENV,
            frontend: 'http://localhost:3001'
        });
    });
}

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