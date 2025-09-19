import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Lock, CheckCircle, AlertCircle, 
  ArrowLeft, DollarSign, Gift, Shield, Clock,
  User, Mail, MapPin, Phone, Calendar, Star,
  Trophy, Award, Users, BookOpen, Play
} from 'lucide-react';

const CoursePayment = ({ course, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Course Review, 2: Payment Details, 3: Processing, 4: Success
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    country: 'US',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment plans for higher-priced courses
  const paymentPlans = [
    {
      id: 'full',
      name: 'Pay in Full',
      price: course.price,
      savings: course.originalPrice ? course.originalPrice - course.price : 0,
      popular: true
    },
    {
      id: '3month',
      name: '3 Monthly Payments',
      price: Math.ceil(course.price / 3),
      totalPrice: Math.ceil(course.price / 3) * 3,
      savings: 0,
      popular: false
    },
    {
      id: '6month',
      name: '6 Monthly Payments', 
      price: Math.ceil((course.price * 1.1) / 6), // Small fee for payment plan
      totalPrice: Math.ceil((course.price * 1.1) / 6) * 6,
      savings: 0,
      popular: false
    }
  ];

  const [selectedPlan, setSelectedPlan] = useState('full');
  const currentPlan = paymentPlans.find(p => p.id === selectedPlan);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 2) {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
      if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      if (!formData.cvv) newErrors.cvv = 'CVV is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePayment = async () => {
    if (!validateStep(2)) return;
    
    setIsProcessing(true);
    setStep(3);
    
    try {
      // Create enrollment through backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          studentEmail: formData.email,
          studentName: `${formData.firstName} ${formData.lastName}`,
          paymentPlan: selectedPlan,
          paymentData: {
            cardNumber: formData.cardNumber,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv,
            billingAddress: formData.billingAddress
          }
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Success - move to confirmation step
        setTimeout(() => {
          setStep(4);
          setIsProcessing(false);
          
          // Call success callback
          setTimeout(() => {
            onSuccess && onSuccess({
              course,
              plan: currentPlan,
              student: {
                email: formData.email,
                name: `${formData.firstName} ${formData.lastName}`
              },
              enrollment: data.enrollment
            });
          }, 2000);
        }, 2000);
      } else {
        // Handle API error
        throw new Error(data.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      setStep(2); // Go back to payment form
      setErrors({ 
        payment: error.message || 'Payment processing failed. Please try again.' 
      });
    }
  };

  const PaymentPlanCard = ({ plan, selected, onSelect }) => (
    <div 
      onClick={() => onSelect(plan.id)}
      className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
        selected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="font-bold text-lg text-gray-900 mb-2">{plan.name}</h3>
        <div className="text-3xl font-bold text-purple-600 mb-1">
          ${plan.price.toLocaleString()}
        </div>
        {plan.totalPrice && plan.totalPrice !== plan.price && (
          <div className="text-sm text-gray-600">
            ${plan.totalPrice.toLocaleString()} total
          </div>
        )}
        {plan.savings > 0 && (
          <div className="text-sm text-green-600 font-medium mt-2">
            Save ${plan.savings.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );

  if (!course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={step > 1 ? () => setStep(step - 1) : onClose}
                className="mr-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Complete Your Enrollment</h1>
                <p className="text-purple-100">Step {step} of 4</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              {['Review', 'Payment', 'Processing', 'Success'].map((label, index) => (
                <span key={index} className={`text-sm ${index + 1 <= step ? 'text-white' : 'text-purple-300'}`}>
                  {label}
                </span>
              ))}
            </div>
            <div className="w-full bg-purple-400 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Step 1: Course Review */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Details</h2>
                  
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                        <p className="text-gray-600 mt-1">{course.subtitle}</p>
                        <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {course.duration}
                          </div>
                          <div className="flex items-center">
                            <Play className="w-4 h-4 mr-1" />
                            {course.lessons} lessons
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-400" />
                            {course.rating} ({course.reviews} reviews)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">What's Included</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.features.slice(0, 6).map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Payment Plan</h3>
                  <div className="space-y-4">
                    {paymentPlans.map(plan => (
                      <PaymentPlanCard 
                        key={plan.id}
                        plan={plan}
                        selected={selectedPlan === plan.id}
                        onSelect={setSelectedPlan}
                      />
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">30-Day Money Back Guarantee</span>
                    </div>
                    <p className="text-green-700 text-sm mt-2">
                      Not satisfied? Get a full refund within 30 days, no questions asked.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleNextStep}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Details */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>
                  
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="John"
                          />
                          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Doe"
                          />
                          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="john@example.com"
                          />
                          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={formData.cardNumber}
                                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                                className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:border-purple-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="1234 5678 9012 3456"
                              />
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry *</label>
                              <input
                                type="text"
                                value={formData.expiryDate}
                                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="MM/YY"
                              />
                              {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                              <input
                                type="text"
                                value={formData.cvv}
                                onChange={(e) => handleInputChange('cvv', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="123"
                              />
                              {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-xl p-6 sticky top-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{course.title}</span>
                        <span className="font-semibold">${course.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Plan</span>
                        <span className="font-semibold">{currentPlan.name}</span>
                      </div>
                      {currentPlan.savings > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Savings</span>
                          <span>-${currentPlan.savings.toLocaleString()}</span>
                        </div>
                      )}
                      <hr />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${currentPlan.price.toLocaleString()}</span>
                      </div>
                      {selectedPlan !== 'full' && (
                        <div className="text-sm text-gray-600">
                          ${currentPlan.totalPrice.toLocaleString()} total over {selectedPlan === '3month' ? '3' : '6'} payments
                        </div>
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <Lock className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-blue-800 font-medium">Secure Payment</span>
                      </div>
                      <p className="text-blue-700 text-sm mt-1">
                        Your payment information is encrypted and secure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Error Display */}
              {errors.payment && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800 font-medium">Payment Error</span>
                  </div>
                  <p className="text-red-700 text-sm mt-2">{errors.payment}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Complete Payment - ${currentPlan.price.toLocaleString()}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 3 && (
            <div className="text-center py-16">
              <div className="animate-spin w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Your Payment</h2>
              <p className="text-gray-600">Please wait while we process your enrollment...</p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Course!</h2>
              <p className="text-xl text-gray-600 mb-8">
                Your enrollment is complete. Check your email for access instructions.
              </p>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
                <h3 className="text-lg font-bold text-gray-900 mb-4">What's Next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Check your email ({formData.email}) for course access details</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Join our private community to connect with other students</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Download the course materials and bonus resources</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  Access Course Now
                </button>
                <button 
                  onClick={onClose}
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePayment;