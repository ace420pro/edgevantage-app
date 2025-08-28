const mongoose = require('mongoose');

// Enrollment Schema - Tracks user course enrollments and progress
const enrollmentSchema = new mongoose.Schema({
  // User & Course References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Enrollment Details
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'suspended', 'cancelled'],
    default: 'active'
  },
  
  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'manual', 'free'],
      required: true
    },
    transactionId: String,
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentPlan: {
      type: String,
      enum: ['full', '3month', '6month', '12month'],
      default: 'full'
    },
    installments: [{
      amount: Number,
      dueDate: Date,
      paidDate: Date,
      status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'failed'],
        default: 'pending'
      },
      transactionId: String
    }]
  },
  
  // Progress Tracking
  progress: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastAccessedAt: Date,
    currentModuleId: mongoose.Schema.Types.ObjectId,
    currentLessonId: mongoose.Schema.Types.ObjectId,
    completedModules: [{
      moduleId: mongoose.Schema.Types.ObjectId,
      completedAt: Date
    }],
    completedLessons: [{
      lessonId: mongoose.Schema.Types.ObjectId,
      moduleId: mongoose.Schema.Types.ObjectId,
      completedAt: Date,
      timeSpent: Number, // in seconds
      attempts: Number
    }],
    totalTimeSpent: {
      type: Number, // in seconds
      default: 0
    }
  },
  
  // Quiz & Assessment Scores
  assessments: [{
    lessonId: mongoose.Schema.Types.ObjectId,
    type: {
      type: String,
      enum: ['quiz', 'assignment', 'exam']
    },
    score: Number,
    maxScore: Number,
    percentage: Number,
    attempts: Number,
    passed: Boolean,
    completedAt: Date,
    timeSpent: Number, // in seconds
    answers: [{
      questionId: String,
      answer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      points: Number
    }]
  }],
  
  // Notes & Bookmarks
  notes: [{
    lessonId: mongoose.Schema.Types.ObjectId,
    moduleId: mongoose.Schema.Types.ObjectId,
    content: String,
    timestamp: Number, // video timestamp if applicable
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [{
    lessonId: mongoose.Schema.Types.ObjectId,
    moduleId: mongoose.Schema.Types.ObjectId,
    title: String,
    timestamp: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Certification
  certificate: {
    earned: {
      type: Boolean,
      default: false
    },
    earnedAt: Date,
    certificateId: String,
    certificateUrl: String,
    grade: String,
    finalScore: Number
  },
  
  // Access Control
  access: {
    type: {
      type: String,
      enum: ['lifetime', 'subscription', 'limited'],
      default: 'lifetime'
    },
    expiresAt: Date,
    renewalDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Learning Preferences
  preferences: {
    playbackSpeed: {
      type: Number,
      default: 1
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    subtitles: {
      type: Boolean,
      default: false
    },
    emailReminders: {
      type: Boolean,
      default: true
    },
    studySchedule: {
      daysPerWeek: Number,
      hoursPerDay: Number,
      preferredTime: String // 'morning', 'afternoon', 'evening'
    }
  },
  
  // Engagement Metrics
  engagement: {
    lastStreakDate: Date,
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    totalStudyDays: {
      type: Number,
      default: 0
    },
    averageSessionLength: Number, // in minutes
    completionRate: Number,
    quizAverageScore: Number
  },
  
  // Support & Issues
  supportTickets: [{
    subject: String,
    description: String,
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  lastActivityAt: Date
}, {
  timestamps: true
});

// Indexes
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ userId: 1 });
enrollmentSchema.index({ courseId: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ 'progress.percentage': -1 });
enrollmentSchema.index({ enrollmentDate: -1 });
enrollmentSchema.index({ 'certificate.earned': 1 });

// Virtual Properties

// Check if enrollment is expired
enrollmentSchema.virtual('isExpired').get(function() {
  if (this.access.type === 'lifetime') return false;
  if (!this.access.expiresAt) return false;
  return this.access.expiresAt < new Date();
});

// Get remaining days
enrollmentSchema.virtual('remainingDays').get(function() {
  if (this.access.type === 'lifetime') return Infinity;
  if (!this.access.expiresAt) return 0;
  
  const remaining = Math.floor(
    (this.access.expiresAt - new Date()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, remaining);
});

// Instance Methods

// Mark lesson as complete
enrollmentSchema.methods.markLessonComplete = async function(moduleId, lessonId, timeSpent = 0) {
  // Check if already completed
  const alreadyCompleted = this.progress.completedLessons.find(
    l => l.lessonId.toString() === lessonId.toString()
  );
  
  if (!alreadyCompleted) {
    this.progress.completedLessons.push({
      lessonId,
      moduleId,
      completedAt: new Date(),
      timeSpent,
      attempts: 1
    });
  } else {
    alreadyCompleted.attempts += 1;
    alreadyCompleted.timeSpent += timeSpent;
  }
  
  this.progress.totalTimeSpent += timeSpent;
  this.progress.lastAccessedAt = new Date();
  
  // Update progress percentage
  await this.updateProgress();
  
  return this.save();
};

// Update overall progress
enrollmentSchema.methods.updateProgress = async function() {
  // Get course to calculate total lessons
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.courseId);
  
  if (!course) return;
  
  let totalLessons = 0;
  course.modules.forEach(module => {
    totalLessons += module.lessons.length;
  });
  
  const completedLessons = this.progress.completedLessons.length;
  this.progress.percentage = Math.round((completedLessons / totalLessons) * 100);
  
  // Check if course is completed
  if (this.progress.percentage >= 100 && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
};

// Add assessment result
enrollmentSchema.methods.addAssessment = function(assessmentData) {
  const percentage = (assessmentData.score / assessmentData.maxScore) * 100;
  const passed = percentage >= 70; // 70% passing grade
  
  this.assessments.push({
    ...assessmentData,
    percentage,
    passed,
    completedAt: new Date()
  });
  
  // Update quiz average score
  const quizScores = this.assessments
    .filter(a => a.type === 'quiz')
    .map(a => a.percentage);
  
  if (quizScores.length > 0) {
    this.engagement.quizAverageScore = 
      quizScores.reduce((a, b) => a + b, 0) / quizScores.length;
  }
  
  return this.save();
};

// Add note
enrollmentSchema.methods.addNote = function(noteData) {
  this.notes.push({
    ...noteData,
    createdAt: new Date()
  });
  return this.save();
};

// Add bookmark
enrollmentSchema.methods.addBookmark = function(bookmarkData) {
  this.bookmarks.push({
    ...bookmarkData,
    createdAt: new Date()
  });
  return this.save();
};

// Update study streak
enrollmentSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastStreak = this.engagement.lastStreakDate;
  
  if (!lastStreak) {
    // First study day
    this.engagement.currentStreak = 1;
    this.engagement.longestStreak = 1;
    this.engagement.totalStudyDays = 1;
  } else {
    const lastDate = new Date(lastStreak);
    lastDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Already studied today
      return;
    } else if (daysDiff === 1) {
      // Consecutive day
      this.engagement.currentStreak += 1;
      this.engagement.longestStreak = Math.max(
        this.engagement.longestStreak,
        this.engagement.currentStreak
      );
    } else {
      // Streak broken
      this.engagement.currentStreak = 1;
    }
    
    this.engagement.totalStudyDays += 1;
  }
  
  this.engagement.lastStreakDate = today;
  this.lastActivityAt = new Date();
  
  return this.save();
};

// Issue certificate
enrollmentSchema.methods.issueCertificate = async function() {
  if (this.certificate.earned) {
    throw new Error('Certificate already issued');
  }
  
  if (this.progress.percentage < 100) {
    throw new Error('Course not completed');
  }
  
  // Calculate final score based on assessments
  let finalScore = 100; // Default if no assessments
  
  if (this.assessments.length > 0) {
    const totalScore = this.assessments.reduce((sum, a) => sum + a.percentage, 0);
    finalScore = Math.round(totalScore / this.assessments.length);
  }
  
  // Determine grade
  let grade = 'Pass';
  if (finalScore >= 90) grade = 'Distinction';
  else if (finalScore >= 80) grade = 'Merit';
  else if (finalScore >= 70) grade = 'Pass';
  else grade = 'Participation';
  
  this.certificate = {
    earned: true,
    earnedAt: new Date(),
    certificateId: new mongoose.Types.ObjectId().toString(),
    grade,
    finalScore
  };
  
  return this.save();
};

// Static Methods

// Find active enrollments for user
enrollmentSchema.statics.findActiveByUser = function(userId) {
  return this.find({
    userId,
    status: 'active',
    'access.isActive': true
  }).populate('courseId');
};

// Find completed courses for user
enrollmentSchema.statics.findCompletedByUser = function(userId) {
  return this.find({
    userId,
    status: 'completed'
  }).populate('courseId');
};

// Get enrollment statistics for a course
enrollmentSchema.statics.getCourseStats = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { courseId: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        activeEnrollments: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedEnrollments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageProgress: { $avg: '$progress.percentage' },
        averageTimeSpent: { $avg: '$progress.totalTimeSpent' },
        averageQuizScore: { $avg: '$engagement.quizAverageScore' }
      }
    }
  ]);
  
  return stats[0] || {
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    averageProgress: 0,
    averageTimeSpent: 0,
    averageQuizScore: 0
  };
};

// Pre-save middleware
enrollmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;