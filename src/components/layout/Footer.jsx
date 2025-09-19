import React from 'react';
import { Phone, Mail } from 'lucide-react';

const Footer = ({ variant = 'default' }) => {
  // Company contact information
  const COMPANY_PHONE_FORMATTED = '(817) 204-6783';
  const COMPANY_SMS = '+18172046783';
  const COMPANY_EMAIL = 'support@edgevantagepro.com';
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    // Minimal footer for application and confirmation pages
    return (
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <a href={`tel:${COMPANY_SMS}`} className="text-gray-300 hover:text-white transition-colors">
                  {COMPANY_PHONE_FORMATTED}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <a href={`mailto:${COMPANY_EMAIL}`} className="text-gray-300 hover:text-white transition-colors">
                  {COMPANY_EMAIL}
                </a>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-6 pt-6">
              <p className="text-gray-400 text-sm">
                © {currentYear} EdgeVantage. All rights reserved.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mt-2">
                <span>✓ No Investment Required</span>
                <span>✓ We Pay You</span>
                <span>✓ Free Application</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Full footer for overview and other main pages
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">EdgeVantage</h3>
              <p className="text-gray-300 mb-6">
                Connecting homeowners with passive income opportunities through equipment hosting partnerships.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <a href={`tel:${COMPANY_SMS}`} className="text-gray-300 hover:text-white transition-colors">
                    {COMPANY_PHONE_FORMATTED}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  <a href={`mailto:${COMPANY_EMAIL}`} className="text-gray-300 hover:text-white transition-colors">
                    {COMPANY_EMAIL}
                  </a>
                </div>
              </div>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href={`tel:${COMPANY_SMS}`} className="text-gray-300 hover:text-white transition-colors">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href={`mailto:${COMPANY_EMAIL}`} className="text-gray-300 hover:text-white transition-colors">
                    Email Us
                  </a>
                </li>
                <li>
                  <a href={`sms:${COMPANY_SMS}`} className="text-gray-300 hover:text-white transition-colors">
                    Text Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Business Hours */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Hours</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Mon-Fri: 9AM-6PM CST</li>
                <li>Saturday: 10AM-4PM CST</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                © {currentYear} EdgeVantage. All rights reserved. Based in Dallas, TX.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>✓ No Investment Required</span>
                <span>✓ We Pay You</span>
                <span>✓ Free Application</span>
              </div>
            </div>

            {/* Privacy & Terms */}
            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6 mt-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <span className="text-gray-600">
                Powered by EdgeVantage
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;