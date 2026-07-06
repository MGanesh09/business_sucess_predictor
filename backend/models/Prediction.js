const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  shopArea: {
    type: Number,
    required: true,
  },
  rent: {
    type: Number,
    required: true,
  },
  employeesCount: {
    type: Number,
    required: true,
  },
  expectedProductPrice: {
    type: Number,
    required: true,
  },
  expectedDailyCustomers: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  goals: {
    type: String,
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
  },
  scores: {
    locationScore: { type: Number },
    accessibilityScore: { type: Number },
    visibilityScore: { type: Number },
    competitionScore: { type: Number },
  },
  demographics: {
    population: { type: Number },
    ageGroups: { type: Map, of: Number }, // e.g. {"18-25": 20, "26-40": 45}
    incomeLevels: { type: Map, of: Number }, // e.g. {"Low": 15, "Medium": 60, "High": 25}
    occupation: { type: Map, of: Number }, // e.g. {"Students": 30, "Professionals": 50, "Others": 20}
    spendingPower: { type: String }, // e.g. High, Medium, Low
  },
  footTraffic: {
    morning: { type: Number },
    afternoon: { type: Number },
    evening: { type: Number },
    night: { type: Number },
    weekend: { type: Number },
    festival: { type: Number },
  },
  revenuePrediction: {
    daily: { type: Number },
    monthly: { type: Number },
    yearly: { type: Number },
    monthlyProfit: { type: Number },
    yearlyProfit: { type: Number },
  },
  successPrediction: {
    probability: { type: Number },
    riskPercentage: { type: Number },
    businessScore: { type: Number },
    investmentScore: { type: Number },
    growthScore: { type: Number },
    marketScore: { type: Number },
    overallRating: { type: String },
  },
  recommendations: {
    pricing: { type: String },
    openingTime: { type: String },
    closingTime: { type: String },
    staffCount: { type: Number },
    breakEvenMonths: { type: Number },
    roi: { type: Number }, // percentage
    margin: { type: Number }, // percentage
  },
  suppliers: [
    {
      name: { type: String },
      type: { type: String }, // Equipment, Raw Material, Furniture, etc.
      distance: { type: String },
      rating: { type: Number },
    }
  ],
  sentiment: {
    score: { type: Number },
    trendingProducts: [{ type: String }],
    preferences: [{ type: String }],
  },
  events: [
    {
      name: { type: String },
      impact: { type: String }, // High Positive, Neutral, Negative, etc.
      frequency: { type: String },
    }
  ],
  satellite: {
    roadWidth: { type: Number },
    parkingSpace: { type: String }, // e.g. Abundant, Limited, None
    greenArea: { type: Number }, // percentage
    developmentLevel: { type: String }, // e.g. High, Medium, Low
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Prediction', PredictionSchema);
