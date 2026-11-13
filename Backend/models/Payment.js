const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true},
  guest: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
  property: {type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true},
  amount: {type: Number, required: true, min: 0},
  method: {type: String, enum: ['cash'], default: 'cash'},
  status: {type: String, enum: ['due', 'paid'], default: 'due'},
  paidAt: {type: Date, default: null},
}, {timestamps: true});

module.exports = mongoose.model('Payment', paymentSchema);
