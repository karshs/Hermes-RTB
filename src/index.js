const express = require('express');

const app = express();
const PORT = 3000;

// Middleware: teaches Express to read JSON from requests
app.use(express.json());

// my first route
app.get('/', (req, res) => {
    res.json({ message: 'Hermes-RTB is alive!' });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});