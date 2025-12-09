// SCAN MODELS

// Scan model to store all scan history and results
import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  scanType: {
    type: String,
    enum: ['username', 'email', 'phone', 'metadata', 'social', 'password'],
    required: true
  },
  scanInput: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  results: {
    // Username scan results
    platformsFound: [{
      platform: String,
      url: String,
      exists: Boolean,
      publicInfo: String
    }],
    
    // Email scan results
    breaches: [{
      name: String,
      title: String,
      domain: String,
      breachDate: Date,
      addedDate: Date,
      pwnCount: Number,
      description: String,
      dataClasses: [String],
      isVerified: Boolean,
      isFabricated: Boolean,
      isSensitive: Boolean,
      isRetired: Boolean,
      isSpamList: Boolean
    }],
    
    // Phone scan results
    phoneExposure: [{
      source: String,
      type: String,
      details: String,
      riskLevel: String
    }],
    
    // Metadata results
    metadata: {
      fileName: String,
      fileType: String,
      fileSize: Number,
      location: {
        latitude: Number,
        longitude: Number,
        address: String
      },
      deviceInfo: {
        make: String,
        model: String,
        software: String
      },
      timestamps: {
        created: Date,
        modified: Date,
        accessed: Date
      },
      author: String,
      additionalData: mongoose.Schema.Types.Mixed
    },
    
    // General findings
    exposedData: [String],
    riskFactors: [String],
    recommendations: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
scanSchema.index({ userId: 1, createdAt: -1 });
scanSchema.index({ userId: 1, scanType: 1 });

// Method to calculate risk score based on findings
scanSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Username scan scoring
  if (this.scanType === 'username' && this.results.platformsFound) {
    score += Math.min(this.results.platformsFound.length * 5, 30);
  }
  
  // Email breach scoring
  if (this.scanType === 'email' && this.results.breaches) {
    score += Math.min(this.results.breaches.length * 15, 50);
    
    // Extra points for sensitive breaches
    const sensitiveBreaches = this.results.breaches.filter(b => b.isSensitive);
    score += sensitiveBreaches.length * 5;
  }
  
  // Phone exposure scoring
  if (this.scanType === 'phone' && this.results.phoneExposure) {
    score += Math.min(this.results.phoneExposure.length * 10, 40);
  }
  
  // Metadata exposure scoring
  if (this.scanType === 'metadata' && this.results.metadata) {
    if (this.results.metadata.location) score += 20;
    if (this.results.metadata.deviceInfo) score += 10;
    if (this.results.metadata.author) score += 5;
  }
  
  // Cap at 100
  this.riskScore = Math.min(score, 100);
  return this.riskScore;
};

const Scan = mongoose.model('Scan', scanSchema);

export default Scan;