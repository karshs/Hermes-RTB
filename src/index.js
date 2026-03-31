const express = require('express');
const auctionRoutes = require('./routes/auction.routes');

const app = express();
const PORT = 3000;

app.use(express.json());

// Mount routes
app.use('/auctions', auctionRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Hermes-RTB is alive!' });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});