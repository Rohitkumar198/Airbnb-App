const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Review = require('../models/Review');

const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({property: req.params.propertyId})
      .populate('user', 'name profileImage')
      .sort({createdAt: -1});
    res.json({success: true, count: reviews.length, reviews});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

const createReview = async (req, res) => {
  try {
    const {bookingId, rating, comment = ''} = req.body;
    const score = Number(rating);
    if (!bookingId || !Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({success: false, message: 'A booking and a rating from 1 to 5 are required'});
    }
    const booking = await Booking.findOne({_id: bookingId, guest: req.user._id});
    if (!booking) return res.status(404).json({success: false, message: 'Booking not found'});
    if (booking.status !== 'completed') {
      return res.status(400).json({success: false, message: 'You can review a stay after it is completed'});
    }
    const property = await Property.findById(booking.property);
    if (!property) return res.status(404).json({success: false, message: 'Property not found'});

    const review = await Review.create({
      property: property._id,
      user: req.user._id,
      booking: booking._id,
      rating: score,
      comment,
    });
    await review.populate('user', 'name profileImage');
    res.status(201).json({success: true, review});
  } catch (error) {
    const duplicateBookingReview = error.code === 11000;
    res.status(duplicateBookingReview ? 409 : 500).json({
      success: false,
      message: duplicateBookingReview ? 'This booking already has a review' : error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({success: false, message: 'Review not found'});
    if (String(review.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({success: false, message: 'Not authorized'});
    }
    await review.deleteOne();
    res.json({success: true, message: 'Review deleted'});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

module.exports = {getPropertyReviews, createReview, deleteReview};
