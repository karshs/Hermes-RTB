const pool = require('../config/db');
const redis = require('../config/redis');

// GET /auctions - get all active auctions
const getAllAuctions = async (req, res) => {
    try {
        // 1. Check Redis cache first
        const cached = await redis.get('all_auctions');

        if (cached) {
            console.log('⚡ Serving from Redis cache');
            return res.json({
                success: true,
                source: 'cache',
                count: cached.length,
                data: cached
            });
        }

        // 2. Cache miss — hit the database
        console.log('🔍 Cache miss — hitting database');
        const result = await pool.query(
            `SELECT 
        a.id,
        a.title,
        a.description,
        a.start_price,
        a.current_price,
        a.status,
        a.end_time,
        a.created_at,
        u.username AS seller
       FROM auctions a
       JOIN users u ON a.seller_id = u.id
       WHERE a.status = 'active'
       ORDER BY a.created_at DESC`
        );

        // 3. Store in Redis for 30 seconds
        await redis.set('all_auctions', JSON.stringify(result.rows), { ex: 30 });

        res.json({
            success: true,
            source: 'database',
            count: result.rows.length,
            data: result.rows
        });

    } catch (err) {
        console.error('getAllAuctions error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /auctions/:id - get single auction with highest bid
const getAuctionById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Check Redis cache first
        const cached = await redis.get(`auction_${id}`);

        if (cached) {
            console.log(`⚡ Serving auction ${id} from cache`);
            return res.json({
                success: true,
                source: 'cache',
                data: cached
            });
        }

        // 2. Cache miss — hit database
        console.log(`🔍 Cache miss for auction ${id} — hitting database`);
        const auctionResult = await pool.query(
            `SELECT 
        a.*,
        u.username AS seller
       FROM auctions a
       JOIN users u ON a.seller_id = u.id
       WHERE a.id = $1`,
            [id]
        );

        if (auctionResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        const bidResult = await pool.query(
            `SELECT 
        b.amount,
        u.username AS bidder
       FROM bids b
       JOIN users u ON b.user_id = u.id
       WHERE b.auction_id = $1
       ORDER BY b.amount DESC
       LIMIT 1`,
            [id]
        );

        const data = {
            ...auctionResult.rows[0],
            highest_bid: bidResult.rows[0] || null
        };

        // 3. Store in Redis for 10 seconds
        await redis.set(`auction_${id}`, JSON.stringify(data), { ex: 10 });

        res.json({
            success: true,
            source: 'database',
            data
        });

    } catch (err) {
        console.error('getAuctionById error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /auctions - create an auction
const createAuction = async (req, res) => {
    try {
        const { title, description, start_price, end_time } = req.body;
        const seller_id = req.user.id;

        // Validate required fields
        if (!title || !start_price || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'Title, start price and end time are required'
            });
        }

        // Validate end_time is in the future
        if (new Date(end_time) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'End time must be in the future'
            });
        }

        const result = await pool.query(
            `INSERT INTO auctions 
        (title, description, start_price, current_price, seller_id, end_time)
       VALUES ($1, $2, $3, $3, $4, $5)
       RETURNING *`,
            [title, description, start_price, seller_id, end_time]
        );

        res.status(201).json({
            success: true,
            message: 'Auction created successfully',
            data: result.rows[0]
        });

    } catch (err) {
        console.error('createAuction error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// POST /auctions/:id/bid - place a bid
const placeBid = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const { amount } = req.body;
        const user_id = req.user.id;

        // Validate bid amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid bid amount is required'
            });
        }

        // START TRANSACTION
        await client.query('BEGIN');

        // LOCK the auction row so nobody else can touch it
        const auctionResult = await client.query(
            `SELECT * FROM auctions 
       WHERE id = $1 
       FOR UPDATE`,
            [id]
        );

        // Check auction exists
        if (auctionResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            });
        }

        const auction = auctionResult.rows[0];

        // Check auction is still active
        if (auction.status !== 'active') {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Auction is no longer active'
            });
        }

        // Check auction hasn't expired
        if (new Date(auction.end_time) <= new Date()) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Auction has ended'
            });
        }

        // Check bid is higher than current price
        if (parseFloat(amount) <= parseFloat(auction.current_price)) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `Bid must be higher than current price of ${auction.current_price}`
            });
        }

        // Check user is not bidding on their own auction
        if (auction.seller_id === user_id) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'You cannot bid on your own auction'
            });
        }

        // Check user has enough balance
        const userResult = await client.query(
            'SELECT balance FROM users WHERE id = $1',
            [user_id]
        );

        if (parseFloat(userResult.rows[0].balance) < parseFloat(amount)) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // INSERT the bid
        const bidResult = await client.query(
            `INSERT INTO bids (auction_id, user_id, amount)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [id, user_id, amount]
        );

        // UPDATE auction current price
        await client.query(
            `UPDATE auctions 
       SET current_price = $1 
       WHERE id = $2`,
            [amount, id]
        );

        // COMMIT — make it all permanent
        await client.query('COMMIT');

        // Invalidate cache so next request gets fresh data
        await redis.del(`auction_${id}`);
        await redis.del('all_auctions');
        console.log(`🗑️ Cache invalidated for auction ${id}`);

        // BROADCAST to all users watching this auction
        const io = req.app.get('io');
        io.to(`auction_${id}`).emit('new_bid', {
            auction_id: id,
            amount: amount,
            bidder: req.user.username,
            new_current_price: amount,
            timestamp: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Bid placed successfully',
            data: {
                bid: bidResult.rows[0],
                auction_id: id,
                new_current_price: amount
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('placeBid error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        client.release();
    }
};



module.exports = { getAllAuctions, getAuctionById, createAuction, placeBid };