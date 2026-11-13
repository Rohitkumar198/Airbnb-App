const express = require('express');
const protect = require('../middleware/authMiddleware');
const {getPropertyReviews, createReview, deleteReview} = require('../controllers/reviewController');

const router = express.Router();
router.get('/property/:propertyId', getPropertyReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);
module.exports = router;
