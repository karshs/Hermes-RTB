require('dotenv').config();

const express = require('express');
const pool = require('./config/db');
const auctionRoutes = require('./routes/auction.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/auth', authRoutes);

app.use('/auctions', auctionRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Hermes-RTB is alive!',
        environment: process.env.NODE_ENV
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});