const express = require('express');
const router = express.Router();
const { getAllAuctions, getAuctionById } = require('../controllers/auction.controller');

router.get('/', getAllAuctions);
router.get('/:id', getAuctionById);

module.exports = router;
