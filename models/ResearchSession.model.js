import mongoose from 'mongoose';

const researchSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  userEmail: {
    type: String,
    required: false,
    index: true
  },
  chatId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalInput: {
    type: String,
    required: true,
    minlength: 30,
    trim: true
  },
  enhancedInput: {
    type: String,
    default: null,
    trim: true
  },
  refinedProblem: {
    type: String,
    default: null,
    trim: true
  },
  refineProblemEmbedding: {
    type: [Number],
    default: null
  },
  subtopics: [{
    subtopic_id: Number,
    title: String,
    description: String,
    keywords: [String],
    arxiv_search_query: String
  }],
  papers: [{
    title: String,
    authors: [String],
    abstract: String,
    pdfLink: String,
    semanticScore: Number,
    semanticScorePercent: Number,
    embedding: [Number],
    year: Number,
    // Phase 3 enriched data
    summary: String,
    methodology: String,
    algorithmsUsed: [String],
    result: String,
    conclusion: String,
    limitations: String,
    futureScope: String
  }],
  // Phase 4 Analysis Results
  phase4Analysis: {
    mostCommonMethodologies: [{
      title: String,
      description: String
    }],
    technologyOrAlgorithms: [String],
    datasetsUsed: [String],
    uniqueOrLessCommonApproaches: [{
      title: String,
      description: String
    }]
  },
  // Phase 5 Solutions
  phase5Solutions: [{
    title: String,
    summary: String,
    features: [String],
    limitations: [String],
    targetUsers: String,
    platformType: String,
    officialWebsite: String,
    documentationLink: String,
    pricingOrLicense: String
  }],
  phase5Notes: String,
  // Phase 6 Best Solution
  phase6Solution: {
    proposedSolution: String,
    problemUnderstanding: String,
    solutionArchitecture: [String],
    implementationWorkflow: [{
      phaseTitle: String,
      steps: [String]
    }],
    recommendedTechStack: [{
      title: String,
      items: [String]
    }],
    scoringByFactors: [{
      title: String,
      rating: Number,
      description: String
    }],
    limitations: [String],
    additionalInformation: [String]
  },
  phases: {
    phase1: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      },
      startedAt: Date,
      completedAt: Date,
      error: String,
      n8nWebhookSent: {
        type: Boolean,
        default: false
      },
      n8nResponse: mongoose.Schema.Types.Mixed
    },
    phase2: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      },
      startedAt: Date,
      completedAt: Date,
      error: String,
      n8nWebhookSent: {
        type: Boolean,
        default: false
      },
      n8nResponse: mongoose.Schema.Types.Mixed,
      phase2Data: mongoose.Schema.Types.Mixed
    },
    phase3: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      },
      startedAt: Date,
      completedAt: Date,
      error: String,
      n8nWebhookSent: {
        type: Boolean,
        default: false
      },
      n8nResponse: mongoose.Schema.Types.Mixed,
      phase3Data: mongoose.Schema.Types.Mixed
    },
    phase4: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      },
      startedAt: Date,
      completedAt: Date,
      error: String,
      n8nWebhookSent: {
        type: Boolean,
        default: false
      },
      n8nResponse: mongoose.Schema.Types.Mixed,
      phase4Data: mongoose.Schema.Types.Mixed
    },
    phase5: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      },
      startedAt: Date,
      completedAt: Date,
      error: String,
      n8nWebhookSent: {
        type: Boolean,
        default: false
      },
      n8nResponse: mongoose.Schema.Types.Mixed,
      phase5Data: mongoose.Schema.Types.Mixed
    },
    phase6: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      },
      startedAt: Date,
      completedAt: Date,
      error: String,
      n8nWebhookSent: {
        type: Boolean,
        default: false
      },
      n8nResponse: mongoose.Schema.Types.Mixed,
      phase6Data: mongoose.Schema.Types.Mixed
    }
  },
  currentPhase: {
    type: Number,
    default: 1,
    min: 1
  },
  overallStatus: {
    type: String,
    enum: ['initialized', 'processing', 'completed', 'failed'],
    default: 'initialized'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'research_sessions'
});

// Index for faster queries
researchSessionSchema.index({ createdAt: -1 });
researchSessionSchema.index({ overallStatus: 1 });
researchSessionSchema.index({ currentPhase: 1 });

// Virtual for session age
researchSessionSchema.virtual('sessionAge').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Method to update phase status
researchSessionSchema.methods.updatePhaseStatus = function(phaseNumber, status, additionalData = {}) {
  const phaseKey = `phase${phaseNumber}`;
  
  if (!this.phases[phaseKey]) {
    throw new Error(`Phase ${phaseNumber} does not exist`);
  }

  this.phases[phaseKey].status = status;
  
  if (status === 'processing' && !this.phases[phaseKey].startedAt) {
    this.phases[phaseKey].startedAt = new Date();
  }
  
  if (status === 'completed' || status === 'failed') {
    this.phases[phaseKey].completedAt = new Date();
  }

  // Update additional data
  Object.assign(this.phases[phaseKey], additionalData);

  return this.save();
};

// Method to move to next phase
researchSessionSchema.methods.moveToNextPhase = function() {
  this.currentPhase += 1;
  return this.save();
};

const ResearchSession = mongoose.model('ResearchSession', researchSessionSchema);

export default ResearchSession;
