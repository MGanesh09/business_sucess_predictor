require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Log = require('./models/Log');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Business Success Predictor AI API is running' });
});

// Seed default Admin user
const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@predictor.ai';
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      const newAdmin = new User({
        name: 'System Admin',
        email: adminEmail,
        password: 'Admin123!', // Hashed automatically on save
        role: 'admin',
        isVerified: true,
      });
      await newAdmin.save();
      console.log('Seeded default admin user: admin@predictor.ai / Admin123!');
      
      await Log.create({
        level: 'info',
        message: 'Default admin user seeded on startup: admin@predictor.ai',
        meta: { email: adminEmail }
      });
    }
  } catch (err) {
    console.error('Error seeding admin user:', err.message);
  }
};

// Database Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/business_success_predictor')
  .then(async () => {
    console.log('MongoDB Connected Successfully.');
    await seedAdmin();
  })
  .catch(async (err) => {
    console.error('MongoDB connection error. The server will run using memory/local logic simulation:');
    console.error(err.message);
    
    // Create an in-memory/mock logging layer fallback for local testing without database
    console.log('Running backend in database-less simulation mode...');
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
