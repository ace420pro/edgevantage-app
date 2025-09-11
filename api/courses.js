// api/courses.js - Course management endpoints for Education Hub
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edgevantage';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('edgevantage');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Mock course data for now (can be replaced with database content)
const mockCourses = [
  {
    id: 'passive-income-basics',
    title: 'Passive Income Basics',
    description: 'Learn the fundamentals of generating passive income through EdgeVantage',
    thumbnail: '📚',
    duration: '2 hours',
    modules: 5,
    students: 1234,
    rating: 4.8,
    price: 0,
    instructor: 'EdgeVantage Team',
    level: 'Beginner',
    category: 'Fundamentals',
    lessons: [
      { id: 1, title: 'Introduction to Passive Income', duration: '15 min', completed: false },
      { id: 2, title: 'How EdgeVantage Works', duration: '20 min', completed: false },
      { id: 3, title: 'Setting Up Your Equipment', duration: '25 min', completed: false },
      { id: 4, title: 'Maximizing Your Earnings', duration: '30 min', completed: false },
      { id: 5, title: 'Best Practices & Tips', duration: '30 min', completed: false }
    ],
    features: [
      'Lifetime access',
      'Certificate of completion',
      'Mobile friendly',
      'Downloadable resources'
    ]
  },
  {
    id: 'advanced-strategies',
    title: 'Advanced Earning Strategies',
    description: 'Maximize your EdgeVantage earnings with advanced techniques',
    thumbnail: '🚀',
    duration: '3 hours',
    modules: 7,
    students: 856,
    rating: 4.9,
    price: 49,
    instructor: 'John Smith',
    level: 'Advanced',
    category: 'Strategy',
    lessons: [
      { id: 1, title: 'Understanding Network Effects', duration: '25 min', completed: false },
      { id: 2, title: 'Referral Program Mastery', duration: '30 min', completed: false },
      { id: 3, title: 'Location Optimization', duration: '20 min', completed: false },
      { id: 4, title: 'Multiple Device Management', duration: '35 min', completed: false },
      { id: 5, title: 'Tax Optimization Strategies', duration: '25 min', completed: false },
      { id: 6, title: 'Scaling Your Operation', duration: '30 min', completed: false },
      { id: 7, title: 'Case Studies & Success Stories', duration: '25 min', completed: false }
    ],
    features: [
      'Expert instructor',
      'Practical examples',
      'Q&A support',
      '30-day money back guarantee'
    ]
  },
  {
    id: 'tax-guide',
    title: 'Tax Guide for EdgeVantage',
    description: 'Complete guide to handling taxes for your EdgeVantage earnings',
    thumbnail: '📊',
    duration: '1.5 hours',
    modules: 4,
    students: 2103,
    rating: 4.7,
    price: 29,
    instructor: 'Sarah Johnson, CPA',
    level: 'Intermediate',
    category: 'Finance',
    lessons: [
      { id: 1, title: 'Tax Basics for Passive Income', duration: '20 min', completed: false },
      { id: 2, title: 'Record Keeping Best Practices', duration: '25 min', completed: false },
      { id: 3, title: 'Deductions and Write-offs', duration: '20 min', completed: false },
      { id: 4, title: 'Filing Your Taxes', duration: '25 min', completed: false }
    ],
    features: [
      'CPA instructor',
      'Tax templates included',
      'Annual updates',
      'State-specific guidance'
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting & Support',
    description: 'Solve common issues and optimize your EdgeVantage setup',
    thumbnail: '🔧',
    duration: '1 hour',
    modules: 3,
    students: 3421,
    rating: 4.6,
    price: 0,
    instructor: 'EdgeVantage Support',
    level: 'All Levels',
    category: 'Technical',
    lessons: [
      { id: 1, title: 'Common Setup Issues', duration: '20 min', completed: false },
      { id: 2, title: 'Network Optimization', duration: '20 min', completed: false },
      { id: 3, title: 'Getting Help & Support', duration: '20 min', completed: false }
    ],
    features: [
      'Free forever',
      'Regular updates',
      'Video tutorials',
      'Direct support links'
    ]
  }
];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const coursesCollection = db.collection('courses');

    if (req.method === 'GET') {
      // Check if we have courses in database
      const dbCourses = await coursesCollection.find({}).toArray();
      
      if (dbCourses.length === 0) {
        // If no courses in DB, insert mock courses and return them
        await coursesCollection.insertMany(mockCourses);
        return res.status(200).json({
          success: true,
          courses: mockCourses,
          total: mockCourses.length
        });
      }
      
      // Return courses from database
      return res.status(200).json({
        success: true,
        courses: dbCourses,
        total: dbCourses.length
      });
    }

    if (req.method === 'POST') {
      // Create new course
      const courseData = req.body;
      const result = await coursesCollection.insertOne({
        ...courseData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return res.status(201).json({
        success: true,
        message: 'Course created successfully',
        courseId: result.insertedId
      });
    }

    if (req.method === 'PUT') {
      // Update course
      const { id, ...updateData } = req.body;
      const result = await coursesCollection.updateOne(
        { id },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        modified: result.modifiedCount
      });
    }

    if (req.method === 'DELETE') {
      // Delete course
      const { id } = req.query;
      const result = await coursesCollection.deleteOne({ id });

      return res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
        deleted: result.deletedCount
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Courses API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}