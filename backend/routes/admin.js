const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Log = require('../models/Log');

// Admin role check middleware
const adminCheck = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin permissions required' });
  }
};

// @route   GET api/admin/metrics
// @desc    Get system metrics (total users, total predictions, etc.)
router.get('/metrics', [auth, adminCheck], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPredictions = await Prediction.countDocuments();
    const errorLogsCount = await Log.countDocuments({ level: 'error' });
    const recentLogs = await Log.find().sort({ createdAt: -1 }).limit(10);
    
    // Calculate category breakdown
    const predictions = await Prediction.find({}, 'category');
    const categories = {};
    predictions.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });

    res.json({
      totalUsers,
      totalPredictions,
      errorLogsCount,
      recentLogs,
      categoryDistribution: categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving admin metrics' });
  }
});

// @route   GET api/admin/users
// @desc    Get all users (excluding passwords)
router.get('/users', [auth, adminCheck], async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error listing users' });
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user and their predictions/logs
router.delete('/users/:id', [auth, adminCheck], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin accounts' });
    }

    // Delete associated predictions and user profile
    await Prediction.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(req.params.id);

    await Log.create({
      level: 'info',
      message: `Admin deleted user account: ${user.email}`,
      meta: { deletedUserId: user._id, adminId: req.user.id }
    });

    res.json({ message: 'User and all associated predictions successfully deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// @route   GET api/admin/predictions
// @desc    Get all predictions in the system
router.get('/predictions', [auth, adminCheck], async (req, res) => {
  try {
    const predictions = await Prediction.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(predictions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching all predictions' });
  }
});

// @route   GET api/admin/logs
// @desc    Get system logs
router.get('/logs', [auth, adminCheck], async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching system logs' });
  }
});

module.exports = router;
