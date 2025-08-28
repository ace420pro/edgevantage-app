const mongoose = require('mongoose');

// Course Schema - Complete course management system
const courseSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  
  // Instructor Information
  instructor: {
    name: {
      type: String,
      required: true
    },
    bio: String,
    avatar: String,
    credentials: [String]
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  
  // Payment Plans
  paymentPlans: [{
    id: String,
    name: String,
    months: Number,
    pricePerMonth: Number,
    totalPrice: Number,
    description: String
  }],
  
  // Course Details
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subcategory: String,
  tags: [String],
  language: {
    type: String,
    default: 'English'
  },
  
  // Duration & Schedule
  duration: {
    type: String, // "12 weeks", "3 months", etc.
    required: true
  },
  totalHours: Number,
  pace: {
    type: String,
    enum: ['Self-paced', 'Instructor-led', 'Hybrid'],
    default: 'Self-paced'
  },
  
  // Content Structure
  modules: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: mongoose.Types.ObjectId
    },
    order: Number,
    title: String,
    description: String,
    duration: String,
    lessons: [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId
      },
      order: Number,
      title: String,
      description: String,
      type: {
        type: String,
        enum: ['video', 'text', 'quiz', 'assignment', 'download'],
        default: 'video'
      },
      duration: String,
      contentUrl: String,
      isPreview: {
        type: Boolean,
        default: false
      },
      resources: [{
        title: String,
        type: String,
        url: String,
        size: String
      }]
    }]
  }],
  
  // Course Features
  features: [String],
  learningOutcomes: [String],
  requirements: [String],
  targetAudience: [String],
  
  // Bonuses
  bonuses: [{
    title: String,
    description: String,
    value: Number,
    type: String // 'download', 'access', 'consultation', etc.
  }],
  
  // Media
  thumbnail: String,
  previewVideo: String,
  images: [String],
  
  // Enrollment Stats
  enrollmentCount: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Ratings & Reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  
  // Reviews
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: String,
    comment: String,
    helpful: {
      type: Number,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Certification
  certificate: {
    enabled: {
      type: Boolean,
      default: true
    },
    template: String,
    requirements: {
      minProgress: {
        type: Number,
        default: 80
      },
      minQuizScore: {
        type: Number,
        default: 70
      }
    }
  },
  
  // Access Control
  accessType: {
    type: String,
    enum: ['lifetime', 'subscription', 'limited'],
    default: 'lifetime'
  },
  accessDuration: Number, // in days, if limited
  
  // Publishing Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'coming_soon'],
    default: 'draft'
  },
  publishedAt: Date,
  
  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Creator/Admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
courseSchema.index({ slug: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ 'instructor.name': 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ 'rating.average': -1 });
courseSchema.index({ enrollmentCount: -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ title: 'text', description: 'text' }); // Text search

// Virtual Properties
courseSchema.virtual('totalLessons').get(function() {
  return this.modules.reduce((total, module) => 
    total + (module.lessons ? module.lessons.length : 0), 0
  );
});

courseSchema.virtual('totalModules').get(function() {
  return this.modules.length;
});

courseSchema.virtual('discountPercentage').get(function() {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// Instance Methods

// Update rating
courseSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  this.rating.distribution[newRating] += 1;
  return this.save();
};

// Add review
courseSchema.methods.addReview = async function(userId, reviewData) {
  // Check if user already reviewed
  const existingReview = this.reviews.find(r => 
    r.userId.toString() === userId.toString()
  );
  
  if (existingReview) {
    throw new Error('User has already reviewed this course');
  }
  
  this.reviews.push({
    userId,
    ...reviewData
  });
  
  // Update rating
  await this.updateRating(reviewData.rating);
  
  return this.save();
};

// Get preview lessons
courseSchema.methods.getPreviewContent = function() {
  const previewLessons = [];
  
  this.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      if (lesson.isPreview) {
        previewLessons.push({
          moduleTitle: module.title,
          ...lesson.toObject()
        });
      }
    });
  });
  
  return previewLessons;
};

// Calculate estimated completion time
courseSchema.methods.calculateCompletionTime = function() {
  let totalMinutes = 0;
  
  this.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      if (lesson.duration) {
        const match = lesson.duration.match(/(\d+)/);
        if (match) {
          totalMinutes += parseInt(match[1]);
        }
      }
    });
  });
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};

// Static Methods

// Find published courses
courseSchema.statics.findPublished = function(filter = {}) {
  return this.find({
    ...filter,
    status: 'published'
  }).sort('-createdAt');
};

// Find by category
courseSchema.statics.findByCategory = function(category) {
  return this.find({
    category,
    status: 'published'
  }).sort('-enrollmentCount');
};

// Search courses
courseSchema.statics.searchCourses = function(query) {
  return this.find({
    $text: { $search: query },
    status: 'published'
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// Get popular courses
courseSchema.statics.getPopular = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort('-enrollmentCount -rating.average')
    .limit(limit);
};

// Get featured courses
courseSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ 
    status: 'published',
    'rating.average': { $gte: 4.5 },
    enrollmentCount: { $gte: 100 }
  })
  .sort('-rating.average -enrollmentCount')
  .limit(limit);
};

// Pre-save middleware
courseSchema.pre('save', function(next) {
  // Generate slug from title if not provided
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Update timestamp
  this.updatedAt = Date.now();
  
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;