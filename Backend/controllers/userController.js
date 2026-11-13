const User = require('../models/User');

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const {name, phone, profileImage} = req.body;
    const changes = {};
    if (name !== undefined) changes.name = name;
    if (phone !== undefined) changes.phone = phone;
    if (profileImage !== undefined) changes.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      changes,
      {new: true, runValidators: true},
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
