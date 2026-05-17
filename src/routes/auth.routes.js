const express = require('express');
const router = express.Router();
const { register, login, getMe, topUp, getMyBids } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/topup', protect, topUp);
router.get('/bids', protect, getMyBids);

module.exports = router;
