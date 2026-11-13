
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

// =========================
// ADMIN DASHBOARD
// =========================
const getDashboard = async (req, res) => {
  try {
    const [
      properties,
      bookings,
      users,
      revenue,
      recentBookings,
      recentUsers,
    ] = await Promise.all([
      Property.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Booking.find()
        .populate('guest', 'name email')
        .populate('property', 'title location.city')
        .sort({ createdAt: -1 })
        .limit(8),
      User.find()
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    res.json({
      success: true,
      stats: {
        properties,
        bookings,
        users,
        revenue: revenue[0]?.total || 0,
      },
      recentBookings,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// PROPERTY: GET ALL
// =========================
const getProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// PROPERTY: CREATE
// =========================
const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      pricePerNight,
      location,
      images,
      maxGuests,
      bedrooms,
      bathrooms,
      category,
      propertyType,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !location?.city?.trim() ||
      pricePerNight === undefined ||
      !Number.isFinite(Number(pricePerNight)) ||
      Number(pricePerNight) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid title, description, city and price are required',
      });
    }

    const property = await Property.create({
      title: title.trim(),
      description: description.trim(),
      pricePerNight: Number(pricePerNight),
      location: {
        city: location.city.trim(),
        address: location.address || '',
        country: location.country || 'India',
      },
      images: Array.isArray(images) ? images : [],
      maxGuests: Number(maxGuests) || 1,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      ...(category?.trim() && { category: category.trim() }),
      ...(propertyType?.trim() && { propertyType: propertyType.trim() }),
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// PROPERTY: UPDATE
// =========================
const updateProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      pricePerNight,
      location,
      images,
      maxGuests,
      bedrooms,
      bathrooms,
      category,
      propertyType,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !location?.city?.trim() ||
      pricePerNight === undefined ||
      !Number.isFinite(Number(pricePerNight)) ||
      Number(pricePerNight) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid title, description, city and price are required',
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    property.title = title.trim();
    property.description = description.trim();
    property.pricePerNight = Number(pricePerNight);

    property.location = {
      city: location.city.trim(),
      address: location.address || '',
      country: location.country || 'India',
    };

    property.images = Array.isArray(images) ? images : [];
    property.maxGuests = Number(maxGuests) || 1;
    property.bedrooms = Number(bedrooms) || 1;
    property.bathrooms = Number(bathrooms) || 1;
    if (category?.trim()) property.category = category.trim();
    if (propertyType?.trim()) property.propertyType = propertyType.trim();

    await property.save();

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// PROPERTY: DELETE
// =========================
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    const hasBookings = await Booking.exists({
      property: property._id,
    });

    if (hasBookings) {
      return res.status(409).json({
        success: false,
        message: 'This property has bookings and cannot be deleted',
      });
    }

    await property.deleteOne();

    // remove leftovers that pointed to this property
    await require('../models/Wishlist').updateMany(
      { properties: property._id },
      { $pull: { properties: property._id } }
    );
    await Review.deleteMany({ property: property._id });

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// BOOKINGS: GET ALL
// =========================
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('guest', 'name email')
      .populate('property', 'title location.city pricePerNight')
      .sort({ createdAt: -1 });

    res.json({
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

// =========================
// BOOKINGS: DELETE
// =========================
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    await Payment.deleteOne({ booking: booking._id });
    await Review.deleteMany({ booking: booking._id });

    res.json({
      success: true,
      message: 'Booking deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// BOOKINGS: UPDATE STATUS
// =========================
const updateBookingStatus = async (req, res) => {
  try {
    if (
      !['pending', 'confirmed', 'cancelled', 'completed'].includes(
        req.body.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status',
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    )
      .populate('guest', 'name email')
      .populate('property', 'title location.city');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// BOOKINGS: UPDATE PAYMENT
// =========================
const updateBookingPayment = async (req, res) => {
  try {
    if (!['due', 'paid'].includes(req.body.paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status',
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: req.body.paymentStatus },
      { new: true, runValidators: true }
    )
      .populate('guest', 'name email')
      .populate('property', 'title location.city');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        booking: booking._id,
        guest: booking.guest._id,
        property: booking.property._id,
        amount: booking.totalPrice,
        method: booking.paymentMethod || 'cash',
        status: req.body.paymentStatus,
        paidAt:
          req.body.paymentStatus === 'paid' ? new Date() : null,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// PAYMENTS: GET ALL
// =========================
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('guest', 'name email')
      .populate('property', 'title location.city')
      .populate('booking', 'checkIn checkOut status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// REVIEWS: GET ALL
// =========================
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('property', 'title location.city')
      .populate('booking', 'checkIn checkOut')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// REVIEWS: DELETE
// =========================
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.json({
      success: true,
      message: 'Review deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// USERS: GET ALL
// =========================
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role isActive createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// USERS: UPDATE
// =========================
const updateUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account',
      });
    }

    const changes = {};

    if (req.body.role !== undefined) {
      if (!['user', 'guest', 'admin'].includes(req.body.role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role',
        });
      }

      changes.role = req.body.role;
    }

    if (req.body.isActive !== undefined) {
      changes.isActive = Boolean(req.body.isActive);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      changes,
      { new: true, runValidators: true }
    ).select('name email role isActive createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// USERS: DELETE
// =========================
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const Wishlist = require('../models/Wishlist');

    const activeBooking = await Booking.exists({
      status: { $in: ['pending', 'confirmed'] },
      checkOut: { $gt: new Date() },
      guest: user._id,
    });

    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message:
          'Resolve this account’s upcoming reservations before deleting it',
      });
    }

    await Wishlist.deleteOne({
      user: user._id,
    });

    const relatedBookings = await Booking.find({
      guest: user._id,
    }).select('_id');

    const relatedBookingIds = relatedBookings.map(
      (booking) => booking._id
    );

    await Review.deleteMany({
      $or: [
        { user: user._id },
        { booking: { $in: relatedBookingIds } },
      ],
    });

    await Payment.deleteMany({
      $or: [
        { guest: user._id },
        { booking: { $in: relatedBookingIds } },
      ],
    });

    await Booking.deleteMany({
      _id: { $in: relatedBookingIds },
    });

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User and related account data deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// EXPORT ALL CONTROLLERS
// =========================
module.exports = {
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
};
