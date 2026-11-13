const Property = require('../models/Property');
const Review = require('../models/Review');

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getNumericFilter = (value, name, min = 0) => {
  if (value === undefined || value === '') return undefined;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min) {
    const error = new Error(`${name} must be a valid number`);
    error.statusCode = 400;
    throw error;
  }
  return number;
};

const attachRatings = async properties => {
  if (!properties.length) return [];
  const ids = properties.map(property => property._id);
  const ratings = await Review.aggregate([
    {$match: {property: {$in: ids}}},
    {$group: {_id: '$property', averageRating: {$avg: '$rating'}, reviewCount: {$sum: 1}}},
  ]);
  const ratingByProperty = new Map(ratings.map(item => [String(item._id), item]));
  return properties.map(property => {
    const rating = ratingByProperty.get(String(property._id));
    return {
      ...property.toObject(),
      averageRating: rating ? Number(rating.averageRating.toFixed(1)) : null,
      reviewCount: rating?.reviewCount || 0,
    };
  });
};

// GET ALL PROPERTIES
const getProperties = async (req, res) => {
  try {
    const {search, city, category, minPrice, maxPrice, guests, bedrooms, bathrooms, sort} = req.query;

    // Every property in the database is listed (no status / availability filter).
    const filter = {};

    if (city) {
      filter['location.city'] = {
        $regex: escapeRegex(city),
        $options: 'i',
      };
    }

    if (category && category !== 'All') {
      filter.$and = [...(filter.$and || []), {$or: [{category}, {propertyType: category}]}];
    }

    if (search) {
      const expression = {$regex: escapeRegex(search), $options: 'i'};
      filter.$and = [...(filter.$and || []), {$or: [
        {title: expression},
        {'location.city': expression},
        {'location.address': expression},
        {'location.country': expression},
      ]}];
    }

    const min = getNumericFilter(minPrice, 'Minimum price');
    const max = getNumericFilter(maxPrice, 'Maximum price');
    if (min !== undefined || max !== undefined) {
      if (min !== undefined && max !== undefined && min > max) {
        return res.status(400).json({success: false, message: 'Minimum price cannot exceed maximum price'});
      }
      filter.pricePerNight = {};
      if (min !== undefined) filter.pricePerNight.$gte = min;
      if (max !== undefined) filter.pricePerNight.$lte = max;
    }

    const guestCount = getNumericFilter(guests, 'Guests', 1);
    const bedroomCount = getNumericFilter(bedrooms, 'Bedrooms', 0);
    const bathroomCount = getNumericFilter(bathrooms, 'Bathrooms', 0);
    if (guestCount !== undefined) filter.maxGuests = {$gte: guestCount};
    if (bedroomCount !== undefined) filter.bedrooms = {$gte: bedroomCount};
    if (bathroomCount !== undefined) filter.bathrooms = {$gte: bathroomCount};
    if (sort && !['newest', 'price_asc', 'price_desc', 'rating_desc'].includes(sort)) {
      return res.status(400).json({success: false, message: 'Unsupported property sort'});
    }

    const sortOption = sort === 'price_asc' ? {pricePerNight: 1} : sort === 'price_desc' ? {pricePerNight: -1} : {createdAt: -1};
    const foundProperties = await Property.find(filter)
      .sort(sortOption);
    let properties = await attachRatings(foundProperties);
    if (sort === 'rating_desc') {
      properties.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE PROPERTY
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
};
