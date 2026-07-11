const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongooseChat = require('../models/Chat');
const mongoosePrediction = require('../models/Prediction');
const mongoose = require('mongoose');
const MockDb = require('../models/mockDb');

const isDbConnected = () => mongoose.connection.readyState === 1;

const wrapChat = (chat) => {
  if (!chat) return null;
  return {
    ...chat,
    save: async function () {
      if (isDbConnected()) {
        if (typeof this.save === 'function') return this.save();
      }
      return MockDb.update('chats', this._id, this);
    }
  };
};

const wrapPrediction = (pred) => {
  if (!pred) return null;
  return {
    ...pred,
    save: async function () {
      if (isDbConnected()) {
        if (typeof this.save === 'function') return this.save();
      }
      return MockDb.update('predictions', this._id, this);
    }
  };
};

function Chat(data) {
  if (isDbConnected()) {
    return new mongooseChat(data);
  }
  const instance = {
    _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    createdAt: new Date(),
    ...data
  };
  return wrapChat(instance);
}

Chat.find = async (query) => {
  if (isDbConnected()) return mongooseChat.find(query).sort({ createdAt: 1 });
  const raw = MockDb.find('chats', query);
  raw.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return raw.map(wrapChat);
};

const Prediction = {
  findById: async (id) => {
    if (isDbConnected()) return mongoosePrediction.findById(id);
    const raw = MockDb.findById('predictions', id);
    return wrapPrediction(raw);
  }
};

// Helper to generate dynamic, contextual chatbot responses based on prediction details
const generateAIResponse = (question, prediction) => {
  const q = question.toLowerCase();
  const name = prediction.businessName;
  const cat = prediction.category;
  const prob = prediction.successPrediction.probability;
  const score = prediction.scores.locationScore;
  const comp = prediction.scores.competitionScore;
  const rent = prediction.rent;
  const budget = prediction.budget;
  const roi = prediction.recommendations.roi;
  const timeOpen = prediction.recommendations.openingTime;
  const timeClose = prediction.recommendations.closingTime;
  const staff = prediction.recommendations.staffCount;
  
  let reply = "";
  
  if (q.includes('should i start') || q.includes('should i open') || q.includes('is it a good idea')) {
    if (prob >= 75) {
      reply = `Yes, starting **${name}** at this location shows very strong potential! The AI success rating is **${prob}%** (Grade ${prediction.successPrediction.overallRating}). The location accessibility score is **${prediction.scores.accessibilityScore}/100** and competition is manageable. Your estimated annual profit is **$${prediction.revenuePrediction.yearlyProfit.toLocaleString()}**, offering an estimated ROI of **${roi}%**.`;
    } else if (prob >= 55) {
      reply = `Starting **${name}** here is moderately viable, with a success probability of **${prob}%**. You have moderate location visibility, but you should look into optimizing your operating costs. Your monthly rent of **$${rent}** represents a key cost driver. Negotiating a lower rent or starting with a leaner staff of **${staff}** employees could boost your margins.`;
    } else {
      reply = `I would recommend caution before opening **${name}** at this specific spot. The success probability is relatively low at **${prob}%** (Risk: **${prediction.successPrediction.riskPercentage}%**). The main challenges are high competition (Score: **${comp}/100**) and high monthly rent of **$${rent}** relative to your budget. Consider scouting nearby coordinates with lower density or lower overhead.`;
    }
  } else if (q.includes('why is success low') || q.includes('what are the risks') || q.includes('risk')) {
    let risks = [];
    if (rent > (budget / 20)) risks.push(`your monthly rent ($${rent}) is high relative to your budget ($${budget})`);
    if (comp > 60) risks.push(`market saturation is high, with a competition score of ${comp}/100`);
    if (score < 60) risks.push(`the location score is low (${score}/100), meaning foot traffic or visibility is suboptimal`);
    if (prediction.successPrediction.riskPercentage > 40) risks.push(`estimated customer volume might not offset your fixed operating costs`);

    if (risks.length > 0) {
      reply = `The success score is constrained because: \n- ${risks.join('\n- ')}. \n\nTo increase your success probability, we need to address these specific parameters.`;
    } else {
      reply = `Actually, your success rating is quite high (**${prob}%**)! The primary minor risk is the break-even period of **${prediction.recommendations.breakEvenMonths} months**, which requires solid working capital to cover early-stage expenses.`;
    }
  } else if (q.includes('how can i improve') || q.includes('improve') || q.includes('suggestions') || q.includes('what can i do')) {
    reply = `Here are targeted actions to improve **${name}**'s performance at this location:
1. **Optimize Staffing**: Keep your team size to **${staff} employees** initially to minimize operational expenses.
2. **Pricing Structure**: Use a **${prediction.recommendations.pricing}** strategy to attract local demographic groups (primarily working professionals and students).
3. **Store Hours**: Operate between **${timeOpen}** and **${timeClose}** to capture peak foot traffic times (which peak during afternoon/evening).
4. **Rent Mitigation**: If possible, negotiate a grace period or a rent reduction below **$${rent}** to lower your monthly break-even point (currently estimated at **${prediction.recommendations.breakEvenMonths} months**).`;
  } else if (q.includes('what should i invest') || q.includes('budget') || q.includes('how much money') || q.includes('cost')) {
    reply = `For a **${cat}** at this location, your planned budget is **$${budget.toLocaleString()}**. Here is our recommended allocation:
- **Capital Expenditures (Fit-out, Equipment)**: 55% (~$${(budget * 0.55).toLocaleString()})
- **Working Capital Reserve (6 months)**: 25% (~$${(budget * 0.25).toLocaleString()})
- **Marketing & Launch Promotion**: 10% (~$${(budget * 0.10).toLocaleString()})
- **Contingency / Licensing**: 10% (~$${(budget * 0.10).toLocaleString()})

With a monthly rent of **$${rent}**, holding at least **$${(rent * 6).toLocaleString()}** in reserve is critical to survive the initial **${prediction.recommendations.breakEvenMonths}-month** break-even timeline.`;
  } else if (q.includes('which business is best') || q.includes('best business') || q.includes('other business')) {
    reply = `Based on our demographic and foot traffic models for this coordinate:
1. **${cat === 'Cafe' ? 'Supermarket' : 'Cafe'}**: High demand due to local residential density and student population. (Estimated Success: **82%**)
2. **Gym**: Strong potential if there are colleges nearby. (Estimated Success: **75%**)
3. **Salon/Spa**: High success rate if located near offices or high-income residential complexes.

Starting **${cat}** here ranks well, but exploring a hybrid setup (e.g. Cafe + Bookstore) could maximize return per square foot.`;
  } else {
    reply = `Interesting question! Regarding **${name}** (a **${cat}** at this address), our data indicates a population density of **${prediction.demographics.population.toLocaleString()}** people nearby. They are primarily **${prediction.demographics.spendingPower}** spending-power consumers. Let me know if you would like me to detail the foot traffic patterns, competitor ratings, or break-even calculations.`;
  }
  
  return reply;
};

// @route   GET api/chat/history/:predictionId
// @desc    Get chat history for a specific prediction
router.get('/history/:predictionId', auth, async (req, res) => {
  try {
    let chat = await Chat.findOne({
      userId: req.user.id,
      predictionId: req.params.predictionId,
    });

    if (!chat) {
      // Create an empty chat with a welcome message from AI
      const prediction = await Prediction.findById(req.params.predictionId);
      if (!prediction) {
        return res.status(404).json({ message: 'Prediction not found' });
      }

      chat = new Chat({
        userId: req.user.id,
        predictionId: req.params.predictionId,
        messages: [
          {
            sender: 'ai',
            text: `Hello! I am your AI Business Assistant. I have analyzed your business plan for **${prediction.businessName}** at **${prediction.location.address}**. Ask me questions like "Should I start here?", "Why is success low?", "How can I improve?", or "What should I invest?". How can I assist you today?`,
          }
        ]
      });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving chat history' });
  }
});

// @route   POST api/chat/message
// @desc    Send a message to the AI chatbot and receive an answer
router.post('/message', auth, async (req, res) => {
  const { predictionId, text } = req.body;

  if (!predictionId || !text) {
    return res.status(400).json({ message: 'Missing predictionId or message text' });
  }

  try {
    const prediction = await Prediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ message: 'Prediction details not found' });
    }

    let chat = await Chat.findOne({
      userId: req.user.id,
      predictionId: predictionId,
    });

    if (!chat) {
      chat = new Chat({
        userId: req.user.id,
        predictionId: predictionId,
        messages: [],
      });
    }

    // Add user message
    chat.messages.push({
      sender: 'user',
      text: text,
    });

    // Generate AI response
    const aiReply = generateAIResponse(text, prediction);

    // Add AI message
    chat.messages.push({
      sender: 'ai',
      text: aiReply,
    });

    await chat.save();
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error processing chatbot message' });
  }
});

module.exports = router;
