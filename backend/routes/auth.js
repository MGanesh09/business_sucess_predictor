const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongooseUser = require('../models/User');
const mongooseLog = require('../models/Log');
const mongoose = require('mongoose');
const MockDb = require('../models/mockDb');
const bcrypt = require('bcryptjs');

const isDbConnected = () => mongoose.connection.readyState === 1;

const wrapUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    comparePassword: async function (enteredPassword) {
      return bcrypt.compare(enteredPassword, this.password);
    },
    save: async function () {
      if (isDbConnected()) {
        if (typeof this.save === 'function') return this.save();
      }
      if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }
      return MockDb.update('users', this._id, this);
    }
  };
};

function User(data) {
  if (isDbConnected()) {
    return new mongooseUser(data);
  }
  const instance = {
    _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    createdAt: new Date(),
    ...data
  };
  return wrapUser(instance);
}

User.findOne = async (query) => {
  if (isDbConnected()) return mongooseUser.findOne(query);
  const raw = MockDb.findOne('users', query);
  return wrapUser(raw);
};

User.findById = async (id) => {
  if (isDbConnected()) return mongooseUser.findById(id);
  const raw = MockDb.findById('users', id);
  return wrapUser(raw);
};

const Log = {
  create: async (data) => {
    if (isDbConnected()) return mongooseLog.create(data);
    return MockDb.create('logs', data);
  }
};

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'supersecretjwtkeyforbusinesspredictor',
    { expiresIn: '7d' }
  );
};

// @route   POST api/auth/register
// @desc    Register a user (sends mock OTP)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user = new User({
      name,
      email,
      password,
      otp,
      otpExpiry,
      isVerified: false,
    });

    await user.save();

    // Log the registration
    await Log.create({
      level: 'info',
      message: `User registered: ${email}. OTP generated: ${otp}`,
      meta: { email }
    });

    // In production, send email. For production-ready local testing, we return OTP in response.
    res.status(201).json({
      message: 'Registration successful. OTP sent to email.',
      email,
      otp, // Sending OTP back for instant local login experience!
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/otp-verify
// @desc    Verify OTP & activate account
router.post('/otp-verify', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials or user not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = generateToken(user);

    await Log.create({
      level: 'info',
      message: `User verified: ${email}`,
      meta: { email }
    });

    res.json({
      message: 'Account verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      // Regenerate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      return res.status(401).json({
        message: 'Account not verified. New OTP sent.',
        email: user.email,
        otp, // Return for local verification
        needsVerification: true
      });
    }

    const token = generateToken(user);

    await Log.create({
      level: 'info',
      message: `User logged in: ${email}`,
      meta: { email }
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/forgot-password
// @desc    Initiate password reset (sends OTP)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await Log.create({
      level: 'info',
      message: `Password reset OTP generated for: ${email}`,
      meta: { email }
    });

    res.json({
      message: 'Password reset OTP sent.',
      email,
      otp, // return OTP for local verification
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset password using OTP
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    user.isVerified = true; // Mark verified if not already
    await user.save();

    await Log.create({
      level: 'info',
      message: `Password reset successful for: ${email}`,
      meta: { email }
    });

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/google-login
// @desc    Authenticate with Google oauth (mocked for ease of use)
router.post('/google-login', async (req, res) => {
  const { email, name, profilePicture } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Create user with random password since they login via Google
      const randomPassword = Math.random().toString(36).substring(2, 15);
      user = new User({
        name,
        email,
        password: randomPassword,
        profilePicture: profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        isVerified: true,
      });
      await user.save();

      await Log.create({
        level: 'info',
        message: `New User registered via Google: ${email}`,
        meta: { email }
      });
    }

    const token = generateToken(user);

    await Log.create({
      level: 'info',
      message: `User logged in via Google: ${email}`,
      meta: { email }
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
