const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Property = require('../models/Property');

// CREATE BOOKING
const createBooking = async (req, res) => {
  try {
    const {propertyId, checkIn, checkOut, guests, paymentMethod = 'cash'} = req.body;

    if (!propertyId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'All booking details are required',
      });
    }

    if (paymentMethod !== 'cash') {
      return res.status(400).json({success: false, message: 'Only cash payment at the property is available'});
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const guestCount = Number(guests);

    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      start >= end ||
      start < new Date(new Date().toDateString())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in or check-out dates',
      });
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guest count',
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    if (guestCount > property.maxGuests) {
      return res.status(400).json({
        success: false,
        message: 'Guest limit exceeded',
      });
    }

    const overlappingBooking = await Booking.findOne({
      property: propertyId,
      status: {$in: ['pending', 'confirmed']},
      checkIn: {$lt: end},
      checkOut: {$gt: start},
    });

    if (overlappingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Property is already booked for these dates',
      });
    }

    const nights = Math.ceil(
      (end - start) / (1000 * 60 * 60 * 24),
    );

    const booking = await Booking.create({
      guest: req.user._id,
      property: propertyId,
      checkIn: start,
      checkOut: end,
      guests: guestCount,
      totalPrice: nights * property.pricePerNight,
      paymentMethod,
      paymentStatus: 'due',
    });

    try {
      await Payment.create({
        booking: booking._id,
        guest: req.user._id,
        property: property._id,
        amount: booking.totalPrice,
        method: 'cash',
        status: 'due',
      });
    } catch (paymentError) {
      await booking.deleteOne();
      throw paymentError;
    }

    res.status(201).json({
      success: true,
      message: 'Booking request submitted',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MY BOOKINGS
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      guest: req.user._id,
    })
      .populate('property')
      .sort({createdAt: -1});

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CANCEL BOOKING
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled',
      });
    }

    booking.status = 'cancelled';

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
};
