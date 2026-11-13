const express = require('express');
const protect = require('../middleware/authMiddleware');
const {getMyPayments} = require('../controllers/paymentController');

const router = express.Router();
router.get('/my-payments', protect, getMyPayments);
module.exports = router;
