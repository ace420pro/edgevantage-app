import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Clock,
  Shield,
  Database,
  Mail,
  X
} from 'lucide-react';
import { Button, Card, Alert, ProgressBar } from './DesignSystem';

// Enhanced Loading Flow - Comprehensive progress indication and error handling
// Implements multi-step progress, retry mechanisms, and accessibility announcements

const EnhancedLoadingFlow = ({ 
  onComplete, 
  onRetry,
  onCancel,
  trackEvent,
  sessionId,
  formData = {},
  qualificationData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [announcement, setAnnouncement] = useState('');

  const maxRetryAttempts = 3;
  const stepTimeouts = [2000, 1500, 2500, 1000]; // Realistic timing for each step

  // Submission steps with detailed messaging
  const submissionSteps = [
    {
      id: 'validation',
      title: 'Validating Information',
      description: 'Checking form data and qualification requirements',
      icon: Shield,
      details: 'Ensuring all required fields are complete and properly formatted',
      estimatedTime: 2
    },
    {
      id: 'processing',
      title: 'Processing Application',
      description: 'Creating your application record in our system',
      icon: Database,
      details: 'Securely storing your information and generating application ID',
      estimatedTime: 1.5
    },
    {
      id: 'verification',
      title: 'Verification Check',
      description: 'Running qualification and eligibility verification',
      icon: CheckCircle,
      details: 'Confirming your qualification status and program eligibility',
      estimatedTime: 2.5
    },
    {
      id: 'confirmation',
      title: 'Sending Confirmation',
      description: 'Preparing and sending confirmation email',
      icon: Mail,
      details: 'Generating confirmation email with next steps and application details',
      estimatedTime: 1
    }
  ];

  // Calculate overall progress
  const calculateProgress = () => {
    if (hasError) return (currentStep / submissionSteps.length) * 100;
    
    const completedSteps = currentStep;
    const totalSteps = submissionSteps.length;
    const baseProgress = (completedSteps / totalSteps) * 100;
    
    // Add partial progress for current step if in progress
    if (currentStep < totalSteps && !hasError) {
      const stepProgress = Math.min(25, ((Date.now() - stepStartTime) / stepTimeouts[currentStep]) * 25);
      return Math.min(100, baseProgress + stepProgress);
    }
    
    return baseProgress;
  };

  // Handle step completion
  const completeStep = () => {
    const step = submissionSteps[currentStep];
    
    // Track step completion
    trackEvent('submission_step_complete', {
      step_id: step.id,
      step_index: currentStep,
      duration_ms: Date.now() - stepStartTime,
      session_id: sessionId,
      retry_attempt: retryAttempts
    });

    // Announce step completion for screen readers
    setAnnouncement(`${step.title} completed. ${
      currentStep < submissionSteps.length - 1 
        ? `Moving to ${submissionSteps[currentStep + 1].title}`
        : 'Application submission complete'
    }`);

    if (currentStep < submissionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setStepStartTime(Date.now());
    } else {
      // All steps complete
      trackEvent('submission_complete', {
        total_duration_ms: Date.now() - startTime,
        session_id: sessionId,
        retry_attempts: retryAttempts,
        qualification_level: qualificationData.level || 'unknown'
      });
      
      setAnnouncement('Application submitted successfully. Redirecting to confirmation page.');
      setTimeout(() => onComplete(), 1000);
    }
  };

  // Handle step failure
  const handleStepFailure = (error) => {
    const step = submissionSteps[currentStep];
    
    setHasError(true);
    setErrorMessage(getErrorMessage(step.id, error));
    
    // Track step failure
    trackEvent('submission_step_error', {
      step_id: step.id,
      step_index: currentStep,
      error_type: error.type || 'unknown',
      error_message: error.message || 'Unknown error',
      retry_attempt: retryAttempts,
      session_id: sessionId
    });

    // Announce error for screen readers
    setAnnouncement(`Error during ${step.title}. ${getErrorMessage(step.id, error)}`);
  };

  // Get contextual error messages
  const getErrorMessage = (stepId, error) => {
    const errorMessages = {
      validation: {
        default: 'There was an issue validating your information. Please check your form data.',
        network: 'Connection issue while validating. Please check your internet connection.',
        server: 'Our validation service is temporarily unavailable. Please try again.'
      },
      processing: {
        default: 'Unable to process your application at this time. Please try again.',
        network: 'Connection lost while processing. Your data is safe, please retry.',
        server: 'Our application system is experiencing high load. Please try again shortly.'
      },
      verification: {
        default: 'Verification check could not be completed. Please try again.',
        network: 'Connection issue during verification. Please check your internet connection.',
        server: 'Verification service is temporarily down. Please try again in a few moments.'
      },
      confirmation: {
        default: 'Unable to send confirmation email. Your application was saved successfully.',
        network: 'Email service connection failed. Your application is complete, we\'ll email you shortly.',
        server: 'Email system is busy. Your application is saved, confirmation email will arrive soon.'
      }
    };

    const stepMessages = errorMessages[stepId] || errorMessages.processing;
    return stepMessages[error?.type] || stepMessages.default;
  };

  // Handle retry with exponential backoff
  const handleRetry = () => {
    if (retryAttempts >= maxRetryAttempts) {
      trackEvent('submission_max_retries_exceeded', {
        session_id: sessionId,
        final_step: submissionSteps[currentStep].id
      });
      return;
    }

    setRetryAttempts(retryAttempts + 1);
    setHasError(false);
    setErrorMessage('');
    setStepStartTime(Date.now());
    
    // Calculate exponential backoff delay
    const backoffDelay = Math.min(1000 * Math.pow(2, retryAttempts), 5000);
    
    trackEvent('submission_retry_attempt', {
      step_id: submissionSteps[currentStep].id,
      retry_attempt: retryAttempts + 1,
      backoff_delay: backoffDelay,
      session_id: sessionId
    });

    setAnnouncement(`Retrying ${submissionSteps[currentStep].title}. Attempt ${retryAttempts + 1} of ${maxRetryAttempts}.`);
    
    setTimeout(() => {
      if (onRetry) {
        onRetry(submissionSteps[currentStep].id, retryAttempts + 1);
      }
    }, backoffDelay);
  };

  // Handle cancellation
  const handleCancel = () => {
    trackEvent('submission_cancelled', {
      current_step: submissionSteps[currentStep].id,
      progress_percentage: calculateProgress(),
      session_id: sessionId
    });

    setAnnouncement('Application submission cancelled.');
    
    if (onCancel) {
      onCancel();
    }
  };

  // Auto-progress simulation (replace with actual API calls)
  useEffect(() => {
    if (!hasError && currentStep < submissionSteps.length) {
      const timer = setTimeout(() => {
        // Simulate occasional failures for demonstration
        const shouldFail = Math.random() < 0.1 && retryAttempts === 0; // 10% failure rate on first attempt
        
        if (shouldFail) {
          handleStepFailure({
            type: 'network',
            message: 'Simulated network error'
          });
        } else {
          completeStep();
        }
      }, stepTimeouts[currentStep] || 2000);

      return () => clearTimeout(timer);
    }
  }, [currentStep, hasError, retryAttempts]);

  const currentStepData = submissionSteps[currentStep];
  const progress = calculateProgress();
  const isComplete = currentStep >= submissionSteps.length;
  const canRetry = hasError && retryAttempts < maxRetryAttempts;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        {/* Screen reader announcements */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        >
          {announcement}
        </div>

        <div className="text-center space-y-6">
          {/* Header */}
          <div className="relative">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {hasError ? 'Submission Error' : isComplete ? 'Success!' : 'Processing Application'}
            </h2>
            
            {/* Cancel button */}
            {!isComplete && (
              <button
                onClick={handleCancel}
                className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded p-1"
                aria-label="Cancel submission"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress bar */}
          <ProgressBar 
            value={progress} 
            label={`${Math.round(progress)}% Complete`}
            color={hasError ? 'orange' : isComplete ? 'emerald' : 'blue'}
            size="lg"
          />

          {/* Current step display */}
          {!isComplete && (
            <div className="space-y-4">
              {/* Step icon and title */}
              <div className="flex items-center justify-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  hasError 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {hasError ? (
                    <AlertCircle className="w-6 h-6" />
                  ) : (
                    <currentStepData.icon className="w-6 h-6" />
                  )}
                </div>
                
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentStepData.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {hasError ? errorMessage : currentStepData.description}
                  </p>
                </div>

                {!hasError && (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" aria-hidden="true" />
                )}
              </div>

              {/* Step details */}
              {!hasError && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    {currentStepData.details}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-blue-600">
                    <Clock className="w-3 h-3" />
                    <span>Estimated time: {currentStepData.estimatedTime} seconds</span>
                  </div>
                </div>
              )}

              {/* Error state with retry */}
              {hasError && (
                <div className="space-y-4">
                  <Alert type="error" title="Submission Error">
                    {errorMessage}
                  </Alert>
                  
                  <div className="flex flex-col space-y-3">
                    {canRetry && (
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleRetry}
                        className="w-full"
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Retry ({retryAttempts + 1}/{maxRetryAttempts})
                      </Button>
                    )}
                    
                    {retryAttempts >= maxRetryAttempts && (
                      <Alert type="warning" title="Maximum retries exceeded">
                        Please cancel and try submitting your application again, or contact support if the issue persists.
                      </Alert>
                    )}
                    
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={handleCancel}
                      className="w-full"
                    >
                      Cancel and Return to Form
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completion state */}
          {isComplete && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-emerald-700 mb-2">
                  Application Submitted Successfully!
                </h3>
                <p className="text-gray-600">
                  Your application has been processed and you'll receive a confirmation email shortly.
                </p>
              </div>
            </div>
          )}

          {/* Step progress indicators */}
          {!hasError && (
            <div className="flex justify-center space-x-2 pt-4 border-t border-gray-200">
              {submissionSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index < currentStep 
                      ? 'bg-emerald-500' 
                      : index === currentStep 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300'
                  }`}
                  aria-label={`Step ${index + 1}: ${step.title} ${
                    index < currentStep ? 'completed' : index === currentStep ? 'in progress' : 'pending'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Time estimate */}
          {!hasError && !isComplete && (
            <div className="text-xs text-gray-500">
              <p>
                Estimated completion: {
                  submissionSteps
                    .slice(currentStep)
                    .reduce((total, step) => total + step.estimatedTime, 0)
                } seconds remaining
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EnhancedLoadingFlow;