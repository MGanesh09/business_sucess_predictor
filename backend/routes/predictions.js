const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const Prediction = require('../models/Prediction');
const Log = require('../models/Log');

// Helper to generate mock/fallback prediction data if the ML service is offline
const generateFallbackPrediction = (data) => {
  const { category, budget, rent, shopArea, employeesCount, expectedProductPrice, expectedDailyCustomers, location } = data;
  
  // Calculate relative scores based on inputs
  const rentToBudgetRatio = (rent * 12) / budget;
  const areaEfficiency = shopArea / (employeesCount || 1);
  const potentialDailyRevenue = expectedDailyCustomers * expectedProductPrice;
  
  // Generate semi-random deterministic scores based on coordinates
  const latFactor = Math.abs(Math.sin(location.lat || 0));
  const lngFactor = Math.abs(Math.cos(location.lng || 0));
  
  const locationScore = Math.round(70 + latFactor * 25);
  const accessibilityScore = Math.round(65 + lngFactor * 30);
  const visibilityScore = Math.round(60 + ((latFactor + lngFactor) / 2) * 35);
  
  // High competition in high rent places
  const competitionScore = Math.round(40 + (rent > 2000 ? 40 : 15) * latFactor);
  
  // Demographics estimates based on category & coordinates
  const basePop = Math.round(15000 + latFactor * 45000);
  const spendingPower = rent > 3000 || budget > 100000 ? 'High' : (rent > 1000 ? 'Medium' : 'Low');
  
  // Revenue predictions
  const dailyRev = potentialDailyRevenue * (locationScore / 100) * (0.8 + latFactor * 0.4);
  const monthlyRev = dailyRev * 30;
  const yearlyRev = monthlyRev * 12;
  
  const monthlyExp = rent + (employeesCount * 1800) + (monthlyRev * 0.45); // 45% COGS
  const monthlyProfit = monthlyRev - monthlyExp;
  const yearlyProfit = monthlyProfit * 12;
  
  // Success scores
  const scoreBase = (locationScore + accessibilityScore + visibilityScore - (competitionScore * 0.3)) / 2.7;
  const budgetRisk = rentToBudgetRatio > 0.4 ? 25 : 10;
  const successProb = Math.round(Math.min(95, Math.max(35, scoreBase - budgetRisk + (expectedDailyCustomers > 100 ? 10 : 0))));
  const riskPercentage = Math.round(100 - successProb + (budgetRisk / 2));
  
  const businessScore = Math.round(successProb * 0.95);
  const investmentScore = Math.round(Math.min(98, 50 + (monthlyProfit > 0 ? (monthlyProfit / (budget / 10)) * 40 : 5)));
  const growthScore = Math.round(Math.min(95, 60 + latFactor * 30));
  const marketScore = Math.round(100 - competitionScore + 20);
  
  let overallRating = 'C';
  if (successProb >= 85) overallRating = 'A+';
  else if (successProb >= 75) overallRating = 'A';
  else if (successProb >= 65) overallRating = 'B+';
  else if (successProb >= 55) overallRating = 'B';
  else if (successProb >= 45) overallRating = 'C+';
  
  // Foot traffic distribution
  let footTraffic = { morning: 15, afternoon: 25, evening: 40, night: 20, weekend: 45, festival: 75 };
  if (category === 'Gym') footTraffic = { morning: 45, afternoon: 10, evening: 35, night: 10, weekend: 25, festival: 15 };
  if (category === 'Bakery' || category === 'Cafe') footTraffic = { morning: 35, afternoon: 30, evening: 25, night: 10, weekend: 40, festival: 60 };
  
  return {
    scores: {
      locationScore: Math.min(100, locationScore),
      accessibilityScore: Math.min(100, accessibilityScore),
      visibilityScore: Math.min(100, visibilityScore),
      competitionScore: Math.min(100, competitionScore),
    },
    demographics: {
      population: basePop,
      ageGroups: {
        '18-25': Math.round(15 + latFactor * 20),
        '26-40': Math.round(30 + lngFactor * 15),
        '41-60': Math.round(20 + (1 - latFactor) * 15),
        '60+': Math.round(10 + (1 - lngFactor) * 10),
      },
      incomeLevels: {
        'Low': spendingPower === 'Low' ? 50 : 15,
        'Medium': spendingPower === 'Medium' ? 60 : 35,
        'High': spendingPower === 'High' ? 50 : 15,
      },
      occupation: {
        'Students': Math.round(20 + latFactor * 25),
        'Working Professionals': Math.round(30 + lngFactor * 35),
        'Business Owners': Math.round(10 + (latFactor * lngFactor) * 15),
        'Others': Math.round(15),
      },
      spendingPower,
    },
    footTraffic,
    revenuePrediction: {
      daily: Math.round(dailyRev),
      monthly: Math.round(monthlyRev),
      yearly: Math.round(yearlyRev),
      monthlyProfit: Math.round(monthlyProfit),
      yearlyProfit: Math.round(yearlyProfit),
    },
    successPrediction: {
      probability: successProb,
      riskPercentage: Math.max(5, riskPercentage),
      businessScore: Math.min(100, businessScore),
      investmentScore: Math.min(100, investmentScore),
      growthScore: Math.min(100, growthScore),
      marketScore: Math.min(100, marketScore),
      overallRating,
    },
    recommendations: {
      pricing: expectedProductPrice > 50 ? 'Competitive Premium' : 'Volume/Discount-focused',
      openingTime: category === 'Gym' ? '05:00 AM' : (category === 'Cafe' ? '07:00 AM' : '09:00 AM'),
      closingTime: category === 'Gym' ? '10:00 PM' : (category === 'Cafe' ? '11:00 PM' : '09:00 PM'),
      staffCount: Math.max(1, Math.round(shopArea / 250)),
      breakEvenMonths: Math.max(4, Math.round(budget / (monthlyProfit > 0 ? monthlyProfit : 1000))),
      roi: Math.round(Math.max(0, (yearlyProfit / budget) * 100)),
      margin: Math.round(Math.max(0, (monthlyProfit / monthlyRev) * 100)),
    },
    suppliers: [
      { name: `${category} Supply Hub`, type: 'Raw Material', distance: '1.2 km', rating: 4.5 },
      { name: 'Apex Commercial Equipments', type: 'Equipment', distance: '3.4 km', rating: 4.2 },
      { name: 'Elite Design Furniture Co.', type: 'Furniture', distance: '5.1 km', rating: 4.8 },
      { name: 'Metro Wholesale Market', type: 'Wholesale Market', distance: '7.0 km', rating: 4.0 },
    ],
    sentiment: {
      score: Math.round(60 + latFactor * 35),
      trendingProducts: category === 'Cafe' ? ['Cold Brew', 'Avocado Toast', 'Croissants'] : ['Standard Product A', 'Premium Product B'],
      preferences: ['Eco-friendly packaging', 'Online delivery', 'Contactless payments'],
    },
    events: [
      { name: 'Annual City Festival', impact: 'High Positive', frequency: 'Yearly' },
      { name: 'Weekend Flea Markets', impact: 'Moderate Positive', frequency: 'Weekly' },
      { name: 'College Graduation Week', impact: 'High Positive', frequency: 'Yearly' },
    ],
    satellite: {
      roadWidth: Math.round(8 + latFactor * 14), // meters
      parkingSpace: rent > 2500 ? 'Limited' : 'Abundant',
      greenArea: Math.round(5 + lngFactor * 30),
      developmentLevel: spendingPower === 'High' ? 'High' : 'Medium',
    }
  };
};

// @route   POST api/predictions/create
// @desc    Create a business success prediction
router.post('/create', auth, async (req, res) => {
  const {
    businessName,
    category,
    budget,
    shopArea,
    rent,
    employeesCount,
    expectedProductPrice,
    expectedDailyCustomers,
    description,
    goals,
    location,
  } = req.body;

  if (!businessName || !category || !budget || !shopArea || !rent || !location) {
    return res.status(400).json({ message: 'Please enter all required fields and locate your shop' });
  }

  try {
    let predictionData = null;

    // Try calling the Python ML Service
    try {
      const mlUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
      const mlResponse = await axios.post(`${mlUrl}/predict`, req.body, { timeout: 4000 });
      predictionData = mlResponse.data;
    } catch (mlErr) {
      console.warn('ML Service unreachable or error, invoking Node fallback: ', mlErr.message);
      // Fallback local logic
      predictionData = generateFallbackPrediction(req.body);
    }

    const newPrediction = new Prediction({
      userId: req.user.id,
      businessName,
      category,
      budget,
      shopArea,
      rent,
      employeesCount: employeesCount || 1,
      expectedProductPrice: expectedProductPrice || 10,
      expectedDailyCustomers: expectedDailyCustomers || 50,
      description,
      goals,
      location,
      ...predictionData,
    });

    const savedPrediction = await newPrediction.save();

    await Log.create({
      level: 'info',
      message: `Prediction created for business: ${businessName} (Category: ${category})`,
      meta: { predictionId: savedPrediction._id, userId: req.user.id }
    });

    res.status(201).json(savedPrediction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating prediction' });
  }
});

// @route   GET api/predictions/list
// @desc    Get all predictions for the logged-in user
router.get('/list', auth, async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(predictions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching predictions list' });
  }
});

// @route   GET api/predictions/detail/:id
// @desc    Get prediction details by ID
router.get('/detail/:id', auth, async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({ message: 'Prediction report not found' });
    }

    // Check ownership (unless admin)
    if (prediction.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to view this report' });
    }

    res.json(prediction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching report details' });
  }
});

// @route   DELETE api/predictions/delete/:id
// @desc    Delete a prediction report
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({ message: 'Prediction report not found' });
    }

    // Check ownership (unless admin)
    if (prediction.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this report' });
    }

    await Prediction.findByIdAndDelete(req.params.id);

    await Log.create({
      level: 'info',
      message: `Prediction report deleted: ${prediction.businessName}`,
      meta: { predictionId: req.params.id, userId: req.user.id }
    });

    res.json({ message: 'Prediction report removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting report' });
  }
});

module.exports = router;
