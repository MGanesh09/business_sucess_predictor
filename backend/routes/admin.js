const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongooseUser = require('../models/User');
const mongoosePrediction = require('../models/Prediction');
const mongooseLog = require('../models/Log');
const mongoose = require('mongoose');
const MockDb = require('../models/mockDb');

const isDbConnected = () => mongoose.connection.readyState === 1;

class MockQuery {
  constructor(dataPromise) {
    this.dataPromise = dataPromise;
  }
  
  then(onfulfilled, onrejected) {
    return this.dataPromise.then(onfulfilled, onrejected);
  }
  
  catch(onrejected) {
    return this.dataPromise.catch(onrejected);
  }
  
  select(fields) {
    this.dataPromise = this.dataPromise.then(data => {
      if (Array.isArray(data)) {
        return data.map(item => {
          const newItem = { ...item };
          if (typeof fields === 'string' && fields.startsWith('-')) {
            delete newItem[fields.substring(1)];
          }
          return newItem;
        });
      }
      return data;
    });
    return this;
  }
  
  sort(sortObj) {
    this.dataPromise = this.dataPromise.then(data => {
      if (Array.isArray(data)) {
        const key = Object.keys(sortObj)[0];
        const dir = sortObj[key];
        data.sort((a, b) => {
          if (key === 'createdAt') {
            return dir === -1 
              ? new Date(b.createdAt) - new Date(a.createdAt)
              : new Date(a.createdAt) - new Date(b.createdAt);
          }
          return dir === -1 ? (b[key] > a[key] ? 1 : -1) : (a[key] > b[key] ? 1 : -1);
        });
      }
      return data;
    });
    return this;
  }
  
  limit(num) {
    this.dataPromise = this.dataPromise.then(data => {
      if (Array.isArray(data)) {
        return data.slice(0, num);
      }
      return data;
    });
    return this;
  }
  
  populate(field, selectFields) {
    this.dataPromise = this.dataPromise.then(data => {
      if (Array.isArray(data)) {
        return data.map(item => {
          const newItem = { ...item };
          if (field === 'userId') {
            const user = MockDb.findById('users', item.userId);
            newItem.userId = user ? { _id: user._id, name: user.name, email: user.email } : null;
          }
          return newItem;
        });
      }
      return data;
    });
    return this;
  }
}

const User = {
  countDocuments: async () => {
    if (isDbConnected()) return mongooseUser.countDocuments();
    return MockDb.find('users').length;
  },
  find: () => {
    if (isDbConnected()) return mongooseUser.find();
    return new MockQuery(Promise.resolve(MockDb.find('users')));
  },
  findById: async (id) => {
    if (isDbConnected()) return mongooseUser.findById(id);
    return MockDb.findById('users', id);
  },
  findByIdAndDelete: async (id) => {
    if (isDbConnected()) return mongooseUser.findByIdAndDelete(id);
    return MockDb.delete('users', id);
  }
};

const Prediction = {
  countDocuments: async () => {
    if (isDbConnected()) return mongoosePrediction.countDocuments();
    return MockDb.find('predictions').length;
  },
  find: (query = {}) => {
    if (isDbConnected()) return mongoosePrediction.find(query);
    return new MockQuery(Promise.resolve(MockDb.find('predictions', query)));
  },
  deleteMany: async (query) => {
    if (isDbConnected()) return mongoosePrediction.deleteMany(query);
    const predictions = MockDb.find('predictions', query);
    predictions.forEach(p => MockDb.delete('predictions', p._id));
    return { deletedCount: predictions.length };
  }
};

const Log = {
  countDocuments: async (query = {}) => {
    if (isDbConnected()) return mongooseLog.countDocuments(query);
    return MockDb.find('logs', query).length;
  },
  find: () => {
    if (isDbConnected()) return mongooseLog.find();
    return new MockQuery(Promise.resolve(MockDb.find('logs')));
  },
  create: async (data) => {
    if (isDbConnected()) return mongooseLog.create(data);
    return MockDb.create('logs', data);
  }
};

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
