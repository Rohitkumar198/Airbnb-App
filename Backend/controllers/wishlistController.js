const Wishlist = require('../models/Wishlist');
const Property = require('../models/Property');

// GET WISHLIST
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    }).populate('properties');

    res.status(200).json({
      success: true,
      properties: wishlist ? wishlist.properties : [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADD PROPERTY TO WISHLIST
const addToWishlist = async (req, res) => {
  try {
    const {propertyId} = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID required',
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      {user: req.user._id},
      {$addToSet: {properties: propertyId}},
      {new: true, upsert: true},
    ).populate('properties');

    res.status(200).json({
      success: true,
      message: 'Added to wishlist',
      properties: wishlist.properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REMOVE PROPERTY
const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      {user: req.user._id},
      {$pull: {properties: req.params.propertyId}},
      {new: true},
    ).populate('properties');

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist',
      properties: wishlist ? wishlist.properties : [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};