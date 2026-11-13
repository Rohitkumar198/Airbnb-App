const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  property: {type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  booking: {type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true},
  rating: {type: Number, required: true, min: 1, max: 5},
  comment: {type: String, trim: true, maxlength: 1200, default: ''},
}, {timestamps: true});

module.exports = mongoose.model('Review', reviewSchema);
