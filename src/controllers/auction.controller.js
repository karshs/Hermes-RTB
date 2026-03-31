// GET /auctions
const getAllAuctions = (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, title: 'Vintage Watch', startPrice: 500, status: 'active' },
            { id: 2, title: 'Antique Lamp', startPrice: 200, status: 'active' },
        ]
    });
};

// GET /auctions/:id
const getAuctionById = (req, res) => {
    const { id } = req.params;
    res.json({
        success: true,
        data: { id, title: 'Vintage Watch', startPrice: 500, status: 'active' }
    });
};

module.exports = { getAllAuctions, getAuctionById };