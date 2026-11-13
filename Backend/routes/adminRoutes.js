
const express = require('express');

const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const {
  getDashboard,

  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,

  getBookings,
  deleteBooking,
  updateBookingStatus,
  updateBookingPayment,

  getPayments,

  getReviews,
  deleteReview,

  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require login and admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', getDashboard);

// Properties CRUD
router.get('/properties', getProperties);
router.post('/properties', createProperty);
router.put('/properties/:id', updateProperty);
router.delete('/properties/:id', deleteProperty);

// Bookings
router.get('/bookings', getBookings);
router.delete('/bookings/:id', deleteBooking);
router.patch('/bookings/:id/status', updateBookingStatus);
router.patch('/bookings/:id/payment', updateBookingPayment);

// Payments
router.get('/payments', getPayments);

// Reviews
router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

// Users
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
