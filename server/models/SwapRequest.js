import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Skills being exchanged
  offeredSkill: {
    name: { type: String, required: true },
    description: String
  },
  requestedSkill: {
    name: { type: String, required: true },
    description: String
  },
  
  // Request details
  message: {
    type: String,
    maxLength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxLength: 1000
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Meeting details (optional)
  scheduledMeeting: {
    date: Date,
    time: String,
    location: String,
    notes: String
  }
}, {
  timestamps: true
});

export default mongoose.model('SwapRequest', swapRequestSchema);