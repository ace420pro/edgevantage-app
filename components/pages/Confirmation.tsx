import React, { memo, useEffect } from 'react';
import { CheckCircle, Copy, Phone, Mail, MessageCircle, DollarSign, Users, Clock, Share2, ChevronRight } from 'lucide-react';
import { ApplicationFormData } from '@/types';
import { useAnalytics } from '@/hooks/useAnalytics';
import toast from 'react-hot-toast';

interface ConfirmationProps {
  formData: ApplicationFormData;
  referralCode: string;
  estimatedEarnings: number;
  onBackToHome: () => void;
}

const Confirmation = memo(({ 
  formData,
  referralCode,
  estimatedEarnings,
  onBackToHome
}: ConfirmationProps) => {
  const { trackEvent, trackPageView } = useAnalytics();
  const COMPANY_PHONE = process.env.NEXT_PUBLIC_COMPANY_PHONE || '(817) 204-6783';
  const COMPANY_SMS = process.env.NEXT_PUBLIC_COMPANY_SMS || '+18172046783';
  const COMPANY_EMAIL = process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'support@edgevantagepro.com';

  useEffect(() => {
    trackPageView('confirmation');
    trackEvent('application_completed', {
      referral_code: referralCode,
      estimated_earnings: estimatedEarnings
    });
  }, [trackPageView, trackEvent, referralCode, estimatedEarnings]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
    trackEvent('copy_to_clipboard', { type, value: text });
  };

  const shareReferralLink = () => {
    const shareUrl = `${window.location.origin}?ref=${referralCode}`;
    const shareText = `I just joined EdgeVantage and I'm earning $${estimatedEarnings}/month passive income! You can too:`;
    
    if (navigator.share) {
      navigator.share({
        title: 'EdgeVantage - Passive Income Opportunity',
        text: shareText,
        url: shareUrl
      });
      trackEvent('share_referral_link', { method: 'native' });
    } else {
      copyToClipboard(shareUrl, 'Referral link');
      trackEvent('share_referral_link', { method: 'clipboard' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-600 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-full mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Congratulations, {formData.fullName}!
              </h1>
              
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Your application has been successfully submitted. You're one step closer to earning
                <span className="font-bold text-white"> ${estimatedEarnings}/month</span> in passive income!
              </p>
            </div>

            <div className="p-8 space-y-8">
              {/* What Happens Next */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Clock className="w-7 h-7 text-blue-600" />
                  What Happens Next?
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Application Review (24-48 hours)</h3>
                      <p className="text-gray-600">Our team will review your application and verify your qualification status.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Personal Consultation Call</h3>
                      <p className="text-gray-600">A specialist will contact you to discuss equipment placement and answer any questions.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Professional Installation</h3>
                      <p className="text-gray-600">Our certified technicians will install the equipment at your convenience.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Start Earning!</h3>
                      <p className="text-gray-600">Begin receiving monthly payments directly to your bank account.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Program */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Users className="w-7 h-7 text-emerald-600" />
                  Earn Extra with Referrals
                </h2>
                
                <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
                  <p className="text-gray-700 mb-4">
                    Share your unique referral code and earn <span className="font-bold text-emerald-600">$50</span> for 
                    each friend who successfully joins the program!
                  </p>
                  
                  <div className="bg-gradient-to-r from-emerald-100 to-blue-100 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Your Referral Code:</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-900">{referralCode}</span>
                      <button
                        onClick={() => copyToClipboard(referralCode, 'Referral code')}
                        className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                        title="Copy referral code"
                      >
                        <Copy className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={shareReferralLink}
                      className="flex-1 bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      Share Link
                    </button>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}?ref=${referralCode}`;
                        copyToClipboard(link, 'Referral link');
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Help? Contact Us</h2>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <a
                    href={`tel:${COMPANY_SMS}`}
                    className="bg-white rounded-xl p-4 hover:shadow-lg transition-shadow group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Call Us</p>
                        <p className="font-semibold text-gray-900">{COMPANY_PHONE}</p>
                      </div>
                    </div>
                  </a>

                  <a
                    href={`sms:${COMPANY_SMS}`}
                    className="bg-white rounded-xl p-4 hover:shadow-lg transition-shadow group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Text Us</p>
                        <p className="font-semibold text-gray-900">{COMPANY_PHONE}</p>
                      </div>
                    </div>
                  </a>

                  <a
                    href={`mailto:${COMPANY_EMAIL}`}
                    className="bg-white rounded-xl p-4 hover:shadow-lg transition-shadow group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email Us</p>
                        <p className="font-semibold text-gray-900 text-sm">support@edgevantagepro.com</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Important Information:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <span>Check your email for confirmation and further instructions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <span>Keep your phone available - we'll call within 24-48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <span>Have proof of residence ready for verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <span>Installation is completely free - no hidden costs</span>
                  </li>
                </ul>
              </div>

              {/* Back to Home Button */}
              <div className="text-center pt-6">
                <button
                  onClick={onBackToHome}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Start New Application
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Your application ID: <span className="font-mono font-bold">{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

Confirmation.displayName = 'Confirmation';

export default Confirmation;