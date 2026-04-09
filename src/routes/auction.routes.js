const express = require('express');
const router = express.Router();


const { getAllAuctions, getAuctionById, createAuction } = require('../controllers/auction.controller');

const { protect } = require('../middleware/auth.middleware');

router.get('/', getAllAuctions);
router.get('/:id', getAuctionById);
router.post('/', protect, createAuction);

module.exports = router;
