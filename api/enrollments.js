// api/enrollments.js - Course enrollment management
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edgevantage';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

// Verify JWT token
function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

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
    const enrollmentsCollection = db.collection('enrollments');
    const coursesCollection = db.collection('courses');
    const usersCollection = db.collection('users');

    // Get user from token
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (req.method === 'GET') {
      if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user's enrollments
      const enrollments = await enrollmentsCollection.find({ 
        userId: decoded.userId 
      }).toArray();

      // Populate course details
      const enrollmentsWithCourses = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await coursesCollection.findOne({ 
            id: enrollment.courseId 
          });
          return {
            ...enrollment,
            course
          };
        })
      );

      return res.status(200).json({
        success: true,
        enrollments: enrollmentsWithCourses,
        total: enrollmentsWithCourses.length
      });
    }

    if (req.method === 'POST') {
      if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { courseId, paymentMethod = 'free' } = req.body;

      // Check if already enrolled
      const existingEnrollment = await enrollmentsCollection.findOne({
        userId: decoded.userId,
        courseId
      });

      if (existingEnrollment) {
        return res.status(400).json({
          error: 'Already enrolled in this course'
        });
      }

      // Get course details
      const course = await coursesCollection.findOne({ id: courseId });
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Create enrollment
      const enrollment = {
        userId: decoded.userId,
        courseId,
        enrolledAt: new Date(),
        progress: 0,
        completedLessons: [],
        status: 'active',
        paymentMethod,
        paidAmount: course.price || 0,
        certificate: null,
        lastAccessedAt: new Date()
      };

      const result = await enrollmentsCollection.insertOne(enrollment);

      // Update course student count
      await coursesCollection.updateOne(
        { id: courseId },
        { $inc: { students: 1 } }
      );

      return res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        enrollmentId: result.insertedId,
        course
      });
    }

    if (req.method === 'PUT') {
      if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { enrollmentId, lessonId, progress } = req.body;

      // Update enrollment progress
      const updateData = {
        lastAccessedAt: new Date()
      };

      if (lessonId) {
        updateData.$addToSet = { completedLessons: lessonId };
      }

      if (progress !== undefined) {
        updateData.progress = progress;
      }

      const result = await enrollmentsCollection.updateOne(
        { 
          _id: new ObjectId(enrollmentId),
          userId: decoded.userId 
        },
        updateData
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      // Check if course is completed (progress === 100)
      if (progress === 100) {
        // Generate certificate
        const certificateId = `CERT-${Date.now()}-${decoded.userId}`;
        await enrollmentsCollection.updateOne(
          { _id: new ObjectId(enrollmentId) },
          { 
            $set: { 
              certificate: {
                id: certificateId,
                issuedAt: new Date(),
                courseId: req.body.courseId
              },
              completedAt: new Date()
            }
          }
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Progress updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { enrollmentId } = req.query;

      const result = await enrollmentsCollection.deleteOne({
        _id: new ObjectId(enrollmentId),
        userId: decoded.userId
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Enrollment cancelled successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Enrollments API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}