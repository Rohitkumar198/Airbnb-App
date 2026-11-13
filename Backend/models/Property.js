const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      city: {type: String, required: true},
      address: {type: String, default: ''},
      country: {type: String, default: 'India'},
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 1,
    },

    images: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      default: 'House',
    },

    propertyType: {
      type: String,
      default: 'Apartment',
      trim: true,
    },

    maxGuests: {
      type: Number,
      default: 2,
      min: 1,
    },

    bedrooms: {
      type: Number,
      default: 1,
    },

    bathrooms: {
      type: Number,
      default: 1,
    },

    amenities: {
      type: [String],
      default: [],
    },

  },
  {timestamps: true},
);

module.exports = mongoose.model('Property', propertySchema);
