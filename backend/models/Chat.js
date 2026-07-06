const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  predictionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction',
    required: true,
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'ai'],
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Chat', ChatSchema);
