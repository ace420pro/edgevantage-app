import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Home, 
  Wifi, 
  Package, 
  ArrowRight,
  Star,
  Users,
  Clock
} from 'lucide-react';
import { RadioGroup, Button, Card, Alert, ProgressBar } from './DesignSystem';

// Progressive Qualification Flow - Accessibility-first implementation
// Reduces friction by allowing partial qualification and alternative paths

const ProgressiveQualificationFlow = ({ 
  onQualificationComplete, 
  trackEvent,
  sessionId 
}) => {
  const [formData, setFormData] = useState({
    hasResidence: '',
    hasInternet: '',
    hasSpace: ''
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [qualificationScore, setQualificationScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Qualification questions with weighted scoring
  const qualificationQuestions = [
    {
      id: 'hasResidence',
      title: 'Do you have a US residence with proof of address?',
      description: 'We need to verify your US residency for equipment installation and legal compliance.',
      icon: Home,
      weight: 3, // Most important requirement
      options: [
        {
          value: 'yes',
          label: 'Yes, I have proof',
          description: 'I can provide utility bills, lease agreement, or mortgage documents',
          icon: '✓'
        },
        {
          value: 'no',
          label: 'No, I don\'t',
          description: 'I don\'t have US residence or proof of address',
          icon: '✗'
        }
      ]
    },
    {
      id: 'hasInternet',
      title: 'Do you have reliable high-speed internet?',
      description: 'A stable internet connection (25+ Mbps) is required for equipment operation.',
      icon: Wifi,
      weight: 2,
      options: [
        {
          value: 'yes',
          label: 'Yes, I have reliable internet',
          description: 'I have 25+ Mbps broadband connection',
          icon: '✓'
        },
        {
          value: 'no',
          label: 'No, limited internet',
          description: 'I have slow or unreliable internet connection',
          icon: '✗'
        }
      ]
    },
    {
      id: 'hasSpace',
      title: 'Do you have space for small equipment?',
      description: 'We need a 2x2 foot area with power access for our compact equipment.',
      icon: Package,
      weight: 1,
      options: [
        {
          value: 'yes',
          label: 'Yes, I have space',
          description: 'I can accommodate a small device in my home',
          icon: '✓'
        },
        {
          value: 'no',
          label: 'No, space is limited',
          description: 'I don\'t have adequate space for equipment',
          icon: '✗'
        }
      ]
    }
  ];

  // Calculate qualification score based on weighted answers
  const calculateQualificationScore = (data = formData) => {
    let score = 0;
    let maxScore = 0;
    
    qualificationQuestions.forEach(question => {
      maxScore += question.weight;
      if (data[question.id] === 'yes') {
        score += question.weight;
      }
    });
    
    return { score, maxScore, percentage: Math.round((score / maxScore) * 100) };
  };

  // Handle answer selection with real-time scoring
  const handleAnswerChange = (questionId, value) => {
    const newFormData = { ...formData, [questionId]: value };
    setFormData(newFormData);
    
    // Calculate new score
    const { score, percentage } = calculateQualificationScore(newFormData);
    setQualificationScore(percentage);
    
    // Track interaction
    trackEvent('qualification_answer', {
      question_id: questionId,
      answer: value,
      qualification_score: percentage,
      session_id: sessionId
    });

    // Auto-advance if answered positively, or show next question
    setTimeout(() => {
      if (currentStep < qualificationQuestions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsComplete(true);
        handleQualificationComplete(newFormData, score, percentage);
      }
    }, 500);
  };

  // Handle qualification completion with different paths
  const handleQualificationComplete = (data, score, percentage) => {
    const { score: finalScore, maxScore } = calculateQualificationScore(data);
    
    if (finalScore === maxScore) {
      // Perfect qualification - proceed to main flow
      trackEvent('qualification_complete', {
        result: 'fully_qualified',
        score: finalScore,
        max_score: maxScore,
        percentage: percentage,
        session_id: sessionId
      });
      
      onQualificationComplete({
        qualified: true,
        level: 'full',
        score: finalScore,
        data: data
      });
    } else if (finalScore >= maxScore * 0.66) {
      // Partial qualification - show priority signup
      trackEvent('qualification_complete', {
        result: 'partially_qualified',
        score: finalScore,
        max_score: maxScore,
        percentage: percentage,
        session_id: sessionId
      });
      
      setShowAlternatives(true);
    } else {
      // Low qualification - show waitlist/alternatives
      trackEvent('qualification_complete', {
        result: 'not_qualified',
        score: finalScore,
        max_score: maxScore,
        percentage: percentage,
        session_id: sessionId
      });
      
      setShowAlternatives(true);
    }
  };

  // Handle alternative path selection
  const handleAlternativeSelection = (path) => {
    trackEvent('alternative_path_selected', {
      path: path,
      qualification_score: qualificationScore,
      session_id: sessionId
    });

    onQualificationComplete({
      qualified: qualificationScore >= 66,
      level: qualificationScore >= 66 ? 'partial' : 'waitlist',
      score: qualificationScore,
      data: formData,
      alternativePath: path
    });
  };

  // Get current question
  const currentQuestion = qualificationQuestions[currentStep];
  const answeredQuestions = Object.values(formData).filter(answer => answer !== '').length;
  const progress = ((currentStep + 1) / qualificationQuestions.length) * 100;

  // Qualification result messages
  const getQualificationMessage = () => {
    if (qualificationScore === 100) {
      return {
        type: 'success',
        title: 'Perfect! You fully qualify!',
        message: 'You meet all requirements for our passive income program. Let\'s get your details and get started!'
      };
    } else if (qualificationScore >= 66) {
      return {
        type: 'warning',
        title: 'Good news! You\'re close to qualifying.',
        message: 'You meet most requirements. We have priority consideration options available for your situation.'
      };
    } else {
      return {
        type: 'info',
        title: 'Thanks for your interest!',
        message: 'While you don\'t meet all current requirements, we have other opportunities and can notify you of future programs.'
      };
    }
  };

  if (showAlternatives && !isComplete) {
    const message = getQualificationMessage();
    
    return (
      <div className="space-y-6">
        {/* Progress indicator */}
        <ProgressBar 
          value={100} 
          label="Qualification Assessment Complete"
          color={qualificationScore >= 66 ? 'emerald' : 'orange'}
        />
        
        {/* Results message */}
        <Alert type={message.type} title={message.title}>
          {message.message}
        </Alert>

        {/* Alternative paths based on qualification level */}
        {qualificationScore >= 66 ? (
          <Card className="space-y-6">
            <div className="text-center">
              <Star className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Priority Consideration Program
              </h3>
              <p className="text-gray-600 text-base">
                You're close to qualifying! Join our priority list for special consideration and updates when requirements change.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => handleAlternativeSelection('priority_waitlist')}
                className="flex-1"
              >
                <Users className="w-5 h-5 mr-2" />
                Join Priority List
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => handleAlternativeSelection('consultation')}
                className="flex-1"
              >
                <Clock className="w-5 h-5 mr-2" />
                Schedule Consultation
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="space-y-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Alternative Opportunities
              </h3>
              <p className="text-gray-600 text-base">
                While our current program isn't a fit, we have other ways you can get involved and earn income.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => handleAlternativeSelection('referral_program')}
                className="w-full"
              >
                <Star className="w-5 h-5 mr-2" />
                Join Referral Program ($50 per referral)
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => handleAlternativeSelection('general_waitlist')}
                className="w-full"
              >
                <Users className="w-5 h-5 mr-2" />
                Join General Waitlist
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                onClick={() => handleAlternativeSelection('explore_other')}
                className="w-full"
              >
                Explore Other Programs
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (isComplete && qualificationScore === 100) {
    return (
      <div className="space-y-6">
        <ProgressBar value={100} label="Qualification Complete" color="emerald" />
        
        <Alert type="success" title="Congratulations! You fully qualify!">
          You meet all requirements for our passive income program. Let's get your contact details and get started!
        </Alert>
        
        <Card className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
          <h3 className="text-2xl font-bold text-emerald-700">
            Welcome to EdgeVantage!
          </h3>
          <p className="text-gray-600">
            You're ready to start earning $500-$1000 per month. Let's collect your information to begin the setup process.
          </p>
          
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => onQualificationComplete({
              qualified: true,
              level: 'full',
              score: qualificationScore,
              data: formData
            })}
            className="mt-6"
          >
            Continue to Application
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <ProgressBar 
        value={progress} 
        label={`Question ${currentStep + 1} of ${qualificationQuestions.length}`}
        showPercentage={false}
      />

      {/* Qualification score display */}
      {answeredQuestions > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              Qualification Score
            </span>
            <span className={`text-lg font-bold ${
              qualificationScore >= 66 ? 'text-emerald-600' : 'text-orange-600'
            }`}>
              {qualificationScore}%
            </span>
          </div>
        </div>
      )}

      {/* Current question */}
      <Card>
        <div className="space-y-6">
          {/* Question header */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <currentQuestion.icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {currentQuestion.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {currentQuestion.description}
              </p>
            </div>
          </div>

          {/* Answer options */}
          <RadioGroup
            name={currentQuestion.id}
            value={formData[currentQuestion.id]}
            onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            options={currentQuestion.options}
            className="space-y-3"
          />
        </div>
      </Card>

      {/* Previous questions summary */}
      {currentStep > 0 && (
        <Card className="bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Your Previous Answers:
          </h4>
          <div className="space-y-2">
            {qualificationQuestions.slice(0, currentStep).map((question, index) => {
              const answer = formData[question.id];
              const option = question.options.find(opt => opt.value === answer);
              
              return (
                <div key={question.id} className="flex items-center space-x-3 text-sm">
                  <question.icon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{question.title}</span>
                  <span className={`font-medium ${
                    answer === 'yes' ? 'text-emerald-600' : 'text-orange-600'
                  }`}>
                    {option?.icon} {option?.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Help text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Answer honestly - we have opportunities for various situations!
        </p>
      </div>
    </div>
  );
};

export default ProgressiveQualificationFlow;