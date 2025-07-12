import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  swapRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: true
  },
  
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxLength: 500
  },
  
  // What skill was exchanged
  skillExchanged: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Ensure one review per swap per reviewer
reviewSchema.index({ reviewer: 1, swapRequest: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);