import React, { memo, useEffect } from 'react';
import { CheckCircle, Share2, Mail, Phone, Calendar, DollarSign } from 'lucide-react';

const Confirmation = memo(({ 
  formData,
  trackEvent,
  trackPageView,
  referralCode,
  estimatedEarnings
}) => {
  useEffect(() => {
    trackPageView('Confirmation Page');
    trackEvent('application_completed', {
      user_name: formData.fullName,
      user_email: formData.email,
      user_state: formData.state,
      event_category: 'Conversion',
      event_label: 'Application Success'
    });
  }, [trackPageView, trackEvent, formData]);

  const shareUrl = `${window.location.origin}/?ref=${referralCode}`;
  
  const handleShare = (platform) => {
    trackEvent('referral_share_attempt', { platform, referral_code: referralCode });
    
    const shareText = `I just applied to earn $250-$500/month in passive income! Check it out: ${shareUrl}`;
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=Passive Income Opportunity&body=${encodeURIComponent(shareText)}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full mb-8 mx-auto shadow-2xl">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully! 
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Thank you, <span className="font-semibold text-emerald-600">{formData.fullName}</span>! 
              Your application has been received and is being reviewed by our team.
            </p>
          </div>

          {/* Progress Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What Happens Next?</h2>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-500 text-white rounded-full font-bold shadow-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Application Review (24-48 hours)
                  </h3>
                  <p className="text-gray-600">
                    Our team will review your application and verify your qualification status.
                  </p>
                </div>
                <div className="text-emerald-500 font-semibold">
                  In Progress
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-300 text-white rounded-full font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Qualification Confirmation
                  </h3>
                  <p className="text-gray-600">
                    If approved, we'll contact you to schedule a brief qualification call and site assessment.
                  </p>
                </div>
                <div className="text-gray-400 font-semibold">
                  Pending
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-300 text-white rounded-full font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Professional Installation
                  </h3>
                  <p className="text-gray-600">
                    Our certified technicians will schedule and complete equipment installation at your convenience.
                  </p>
                </div>
                <div className="text-gray-400 font-semibold">
                  Pending
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-300 text-white rounded-full font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Start Earning!
                  </h3>
                  <p className="text-gray-600">
                    Begin receiving your monthly payments of ${estimatedEarnings}/month via direct deposit.
                  </p>
                </div>
                <div className="text-gray-400 font-semibold">
                  Pending
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Important Information</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  Check Your Email
                </h3>
                <p className="text-gray-600 mb-4">
                  We've sent a confirmation email to <strong>{formData.email}</strong> with your application details and next steps.
                </p>
                <p className="text-sm text-gray-500">
                  Please check your spam folder if you don't see it in your inbox within 10 minutes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  Questions or Concerns?
                </h3>
                <p className="text-gray-600 mb-2">
                  Our support team is available to help:
                </p>
                <p className="text-gray-900 font-semibold">
                  📞 (555) 123-4567<br />
                  📧 support@edgevantage.com
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Monday-Friday, 9am-6pm EST
                </p>
              </div>
            </div>
          </div>

          {/* Earnings Potential */}
          <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white mb-8">
            <div className="text-center">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-emerald-100" />
              <h2 className="text-3xl font-bold mb-4">Your Earning Potential</h2>
              <div className="text-5xl font-bold mb-2">${estimatedEarnings}</div>
              <p className="text-xl text-emerald-100 mb-6">Estimated monthly earnings</p>
              
              <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold">${estimatedEarnings * 3}</div>
                  <div className="text-emerald-100">3 months</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${estimatedEarnings * 6}</div>
                  <div className="text-emerald-100">6 months</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${estimatedEarnings * 12}</div>
                  <div className="text-emerald-100">1 year</div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Program */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <Share2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Earn $50 for Each Referral!
              </h2>
              <p className="text-gray-600 mb-6">
                Share your unique referral link with friends and family. 
                When they successfully complete the program, you'll earn $50!
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Your Referral Code:</p>
                <div className="font-mono text-lg font-bold text-emerald-600">{referralCode}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Your Referral Link:</p>
                <div className="font-mono text-sm text-gray-800 break-all">{shareUrl}</div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => handleShare('facebook')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Share on Facebook
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Share on Twitter
                </button>
                <button
                  onClick={() => handleShare('email')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Share via Email
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>

          {/* New Application Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 inline-flex items-center gap-3"
            >
              Complete Another Application
            </button>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-lg">
              Thank you for choosing EdgeVantage. We're excited to help you start earning passive income!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

Confirmation.displayName = 'Confirmation';

export default Confirmation;