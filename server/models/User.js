import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Replit Auth fields
  replitId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  firstName: String,
  lastName: String,
  profileImageUrl: String,
  
  // Profile fields
  bio: {
    type: String,
    maxLength: 500
  },
  location: String,
  
  // Skills
  skills: {
    offered: [{
      name: { type: String, required: true },
      proficiency: {
        type: String,
        enum: ['beginner', 'intermediate', 'expert'],
        default: 'beginner'
      },
      description: String
    }],
    wanted: [{
      name: { type: String, required: true },
      proficiency: {
        type: String,
        enum: ['beginner', 'intermediate', 'expert'],
        default: 'beginner'
      },
      description: String
    }]
  },
  
  // Availability (simplified)
  availability: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6 // 0 = Sunday, 6 = Saturday
    },
    startTime: String, // e.g., "09:00"
    endTime: String    // e.g., "17:00"
  }],
  
  // Settings
  profileVisible: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  
  // Rating (calculated from reviews)
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

// Index for search functionality
userSchema.index({ 'skills.offered.name': 'text', 'skills.wanted.name': 'text', location: 'text' });

export default mongoose.model('User', userSchema);