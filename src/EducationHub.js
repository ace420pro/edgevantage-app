import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Video, Users, DollarSign, Star, Clock, 
  Play, Lock, CheckCircle, Trophy, Award, ArrowRight,
  Search, Filter, Sort, Grid, List, Eye, Download,
  Calendar, User, Heart, Share2, MessageCircle,
  Zap, Target, TrendingUp, Gift, ShoppingCart, CreditCard
} from 'lucide-react';
import CoursePayment from './CoursePayment';

const EducationHub = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCourse, setPaymentCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses from API
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/courses`);
      const data = await response.json();
      
      if (data.success && data.courses.length > 0) {
        setCourses(data.courses);
      } else {
        // Use fallback data if no courses from API
        setCourses(fallbackCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Use fallback data on error
      setCourses(fallbackCourses);
    } finally {
      setLoading(false);
    }
  };

  // Payment handlers
  const handleEnrollClick = (course) => {
    setPaymentCourse(course);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    // Add course to enrolled courses
    setEnrolledCourses(prev => [...prev, paymentData.course.id]);
    setShowPayment(false);
    setPaymentCourse(null);
    
    // Show success message or redirect to course
    alert(`Successfully enrolled in ${paymentData.course.title}! Check your email for access instructions.`);
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    setPaymentCourse(null);
  };

  // Fallback course data (used when API is unavailable)
  const fallbackCourses = [
    {
      id: 1,
      title: "Complete Passive Income Mastery",
      subtitle: "Learn the exact system EdgeVantage uses to generate $500-1000/month per location",
      description: "This comprehensive course reveals the complete passive income strategy that powers EdgeVantage. You'll learn how to identify opportunities, set up systems, manage operations, and scale to multiple income streams.",
      instructor: "EdgeVantage Team",
      price: 2997,
      originalPrice: 4997,
      level: "Beginner to Advanced",
      duration: "12 weeks",
      students: 847,
      rating: 4.9,
      reviews: 234,
      modules: 8,
      lessons: 47,
      thumbnail: "/api/placeholder/400/225",
      tags: ["Passive Income", "Business Model", "Scaling", "Operations"],
      features: [
        "Complete business model blueprint",
        "Equipment sourcing & partnership strategies", 
        "Location acquisition framework",
        "Automated systems setup",
        "Legal & compliance guidance",
        "Scaling to 50+ locations",
        "1-on-1 coaching calls",
        "Private community access"
      ],
      curriculum: [
        {
          title: "Foundation & Mindset",
          lessons: 6,
          duration: "2.5 hours",
          preview: true
        },
        {
          title: "Business Model Deep Dive",
          lessons: 5,
          duration: "3.1 hours",
          preview: false
        },
        {
          title: "Equipment & Technology",
          lessons: 7,
          duration: "4.2 hours", 
          preview: false
        },
        {
          title: "Location Acquisition",
          lessons: 6,
          duration: "3.8 hours",
          preview: false
        },
        {
          title: "Legal & Compliance",
          lessons: 4,
          duration: "2.1 hours",
          preview: false
        },
        {
          title: "Operations & Management",
          lessons: 8,
          duration: "5.3 hours",
          preview: false
        },
        {
          title: "Scaling Strategies",
          lessons: 6,
          duration: "3.7 hours",
          preview: false
        },
        {
          title: "Advanced Optimization",
          lessons: 5,
          duration: "2.9 hours",
          preview: false
        }
      ],
      bonuses: [
        "Location Scouting Checklist ($297 value)",
        "Legal Document Templates ($497 value)",
        "Partnership Agreement Templates ($397 value)",
        "Scaling Roadmap Workbook ($197 value)"
      ]
    },
    {
      id: 2,
      title: "Location Acquisition Blueprint", 
      subtitle: "Master the art of finding and securing profitable locations",
      description: "Learn our proven 7-step process for identifying, evaluating, and securing the most profitable locations for passive income equipment deployment.",
      instructor: "Sarah Chen, Location Expert",
      price: 1497,
      originalPrice: 1997,
      level: "Intermediate",
      duration: "6 weeks",
      students: 342,
      rating: 4.8,
      reviews: 89,
      modules: 4,
      lessons: 23,
      thumbnail: "/api/placeholder/400/225",
      tags: ["Real Estate", "Location", "Negotiation", "Analysis"],
      features: [
        "Location evaluation framework",
        "Negotiation strategies",
        "Market analysis tools",
        "Contract templates",
        "Site visit checklists"
      ]
    },
    {
      id: 3,
      title: "Equipment Partnerships & Sourcing",
      subtitle: "Build relationships with equipment providers and optimize costs",
      description: "Discover how to establish profitable partnerships with equipment manufacturers, negotiate better terms, and create win-win relationships that scale.",
      instructor: "Mike Rodriguez, Partnership Director", 
      price: 997,
      originalPrice: 1497,
      level: "Beginner",
      duration: "4 weeks",
      students: 156,
      rating: 4.7,
      reviews: 43,
      modules: 3,
      lessons: 18,
      thumbnail: "/api/placeholder/400/225",
      tags: ["Partnerships", "Equipment", "Sourcing", "Negotiation"],
      features: [
        "Vendor identification process",
        "Partnership negotiation tactics",
        "Cost optimization strategies",
        "Quality control frameworks"
      ]
    },
    {
      id: 4,
      title: "Scaling to $10K+/Month",
      subtitle: "Advanced strategies for building a passive income empire",
      description: "Take your passive income business to the next level with advanced scaling strategies, automation systems, and empire-building techniques.",
      instructor: "EdgeVantage Founder",
      price: 4997,
      originalPrice: 7997,
      level: "Advanced",
      duration: "16 weeks",
      students: 89,
      rating: 5.0,
      reviews: 34,
      modules: 10,
      lessons: 67,
      thumbnail: "/api/placeholder/400/225",
      tags: ["Scaling", "Automation", "Advanced", "Empire Building"],
      features: [
        "Multi-location management",
        "Team building & delegation",
        "Advanced automation",
        "Investment strategies",
        "Exit planning"
      ]
    }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "The Truth About Passive Income: What Nobody Tells You",
      excerpt: "Most passive income content online is misleading. Here's the real story behind building sustainable passive income streams.",
      author: "EdgeVantage Team",
      publishDate: "2024-01-15",
      readTime: "8 min read",
      category: "Strategy",
      featured: true,
      thumbnail: "/api/placeholder/400/250"
    },
    {
      id: 2,
      title: "How We Generated $50K in Passive Income in 6 Months",
      excerpt: "A detailed case study of our journey from zero to $50K monthly passive income using the EdgeVantage method.",
      author: "Sarah Chen", 
      publishDate: "2024-01-10",
      readTime: "12 min read",
      category: "Case Study",
      featured: true,
      thumbnail: "/api/placeholder/400/250"
    },
    {
      id: 3,
      title: "Equipment Selection: The Make-or-Break Decision",
      excerpt: "Choosing the right equipment can determine the success of your entire passive income operation. Here's our selection framework.",
      author: "Mike Rodriguez",
      publishDate: "2024-01-05",
      readTime: "6 min read", 
      category: "Equipment",
      featured: false,
      thumbnail: "/api/placeholder/400/250"
    }
  ];

  const CourseCard = ({ course, featured = false }) => (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${featured ? 'ring-2 ring-purple-500' : ''}`}>
      {featured && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 text-sm font-semibold">
          🔥 MOST POPULAR
        </div>
      )}
      
      <div className="aspect-video bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-12 h-12 text-white bg-black bg-opacity-50 rounded-full p-3" />
        </div>
        <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
          {course.duration}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
            {course.level}
          </span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium ml-1">{course.rating}</span>
            <span className="text-gray-500 text-sm ml-1">({course.reviews})</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{course.subtitle}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <User className="w-4 h-4 mr-1" />
          <span className="mr-4">{course.instructor}</span>
          <Users className="w-4 h-4 mr-1" />
          <span>{course.students.toLocaleString()} students</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">${course.price.toLocaleString()}</span>
            {course.originalPrice && (
              <span className="text-gray-500 line-through ml-2">${course.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <button 
            onClick={() => setSelectedCourse(course)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );

  const CourseModal = () => {
    if (!selectedCourse) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="relative">
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <Play className="w-16 h-16 text-white bg-purple-600 rounded-full p-4" />
            </div>
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              ✕
            </button>
          </div>
          
          <div className="p-8">
            {/* Course Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded">
                    {selectedCourse.level}
                  </span>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-medium ml-1">{selectedCourse.rating}</span>
                    <span className="text-gray-500 ml-2">({selectedCourse.reviews} reviews)</span>
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h1>
                <p className="text-xl text-gray-600 mb-6">{selectedCourse.subtitle}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">{selectedCourse.duration}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">{selectedCourse.lessons} Lessons</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">{selectedCourse.students} Students</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Trophy className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Certificate</div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">What You'll Learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCourse.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedCourse.curriculum && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Course Curriculum</h3>
                    <div className="space-y-3">
                      {selectedCourse.curriculum.map((module, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{module.title}</h4>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <span>{module.lessons} lessons</span>
                                <span className="mx-2">•</span>
                                <span>{module.duration}</span>
                                {module.preview && (
                                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                    Preview Available
                                  </span>
                                )}
                              </div>
                            </div>
                            {module.preview ? <Play className="w-5 h-5 text-purple-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Purchase Card */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 sticky top-0">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900">${selectedCourse.price.toLocaleString()}</div>
                    {selectedCourse.originalPrice && (
                      <div className="text-gray-500 line-through">${selectedCourse.originalPrice.toLocaleString()}</div>
                    )}
                    <div className="text-sm text-green-600 font-medium mt-2">
                      Save ${(selectedCourse.originalPrice - selectedCourse.price).toLocaleString()}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleEnrollClick(selectedCourse)}
                    className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors mb-4"
                  >
                    Enroll Now
                  </button>
                  
                  <div className="text-center text-sm text-gray-600 mb-6">
                    30-day money-back guarantee
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Video className="w-4 h-4 text-green-600 mr-3" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-blue-600 mr-3" />
                      <span>Private community</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-orange-600 mr-3" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 text-purple-600 mr-3" />
                      <span>Direct instructor access</span>
                    </div>
                  </div>
                  
                  {selectedCourse.bonuses && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold text-gray-900 mb-3">Bonus Materials</h4>
                      <div className="space-y-2 text-sm">
                        {selectedCourse.bonuses.map((bonus, index) => (
                          <div key={index} className="flex items-start">
                            <Gift className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{bonus}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              EdgeVantage Academy
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Learn the exact strategies we use to generate $500-$1000+ monthly passive income. 
              Build your own passive income empire with our proven system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all">
                Browse Courses
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all">
                Read Success Stories
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['courses', 'blog', 'community', 'success-stories'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 transition-colors capitalize ${
                  activeTab === tab 
                    ? 'border-purple-500 text-purple-600 font-medium' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'courses' && (
          <div>
            {/* Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Premium Courses</h2>
                <p className="text-gray-600">Master the art of passive income generation</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading courses...</p>
              </div>
            ) : (
              <>
                {/* Courses Grid */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
                  {courses.map((course, index) => (
                    <CourseCard key={course.id || course._id} course={course} featured={index === 0} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'blog' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Knowledge Base</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Insights, strategies, and real stories from successful passive income entrepreneurs
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-gray-200"></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded">
                        {post.category}
                      </span>
                      <span className="text-sm text-gray-500">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {post.author.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{post.author}</div>
                          <div className="text-xs text-gray-500">{post.publishDate}</div>
                        </div>
                      </div>
                      <button className="text-purple-600 hover:text-purple-800">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-purple-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Community</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with fellow entrepreneurs, share success stories, and get support on your passive income journey.
            </p>
            <button className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors">
              Join Community
            </button>
          </div>
        )}

        {activeTab === 'success-stories' && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-orange-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Real stories from students who've built successful passive income businesses using our methods.
            </p>
            <div className="text-gray-500">Coming soon...</div>
          </div>
        )}
      </div>

      <CourseModal />
      
      {/* Course Payment Modal */}
      {showPayment && paymentCourse && (
        <CoursePayment 
          course={paymentCourse}
          onClose={handlePaymentClose}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default EducationHub;