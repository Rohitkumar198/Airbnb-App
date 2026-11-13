const Payment = require('../models/Payment');

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({guest: req.user._id})
      .populate('booking', 'checkIn checkOut status')
      .populate('property', 'title location.city images')
      .sort({createdAt: -1});
    res.json({success: true, count: payments.length, payments});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

module.exports = {getMyPayments};
