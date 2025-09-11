import React from 'react';

const FontTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-8">
          Font Implementation Test - EdgeVantage
        </h1>
        
        <div className="space-y-8">
          {/* Display Font Examples */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
              Display Font (Poppins) - Used for Headings & CTAs
            </h2>
            <div className="space-y-4">
              <h1 className="text-4xl font-display font-bold text-gray-900">
                Earn $500-$1,000 Every Month
              </h1>
              <h2 className="text-3xl font-display font-bold text-gray-900">
                Professional Lead Management
              </h2>
              <h3 className="text-2xl font-display font-semibold text-gray-900">
                Passive Income Opportunity
              </h3>
              <button className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-display font-bold text-lg hover:bg-emerald-700 transition-colors">
                Get Started Now
              </button>
            </div>
          </section>

          {/* Body Font Examples */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
              Body Font (Inter) - Used for Content & Forms
            </h2>
            <div className="space-y-4">
              <p className="text-lg font-body text-gray-700">
                This is body text using Inter font. It's highly readable and perfect for longer content.
                Inter was specifically designed for user interfaces and digital screens.
              </p>
              <p className="text-base font-body text-gray-600">
                Regular body text in 16px size. This maintains excellent readability across all devices
                and ensures accessibility compliance with WCAG guidelines.
              </p>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-body focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </section>

          {/* Typography Scale */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
              Typography Scale
            </h2>
            <div className="space-y-3">
              <h1 className="text-4xl font-display font-bold text-gray-900">Heading 1 - Display (36px)</h1>
              <h2 className="text-3xl font-display font-bold text-gray-900">Heading 2 - Display (30px)</h2>
              <h3 className="text-2xl font-display font-semibold text-gray-900">Heading 3 - Display (24px)</h3>
              <h4 className="text-xl font-body font-semibold text-gray-900">Heading 4 - Body (20px)</h4>
              <h5 className="text-lg font-body font-medium text-gray-900">Heading 5 - Body (18px)</h5>
              <p className="text-base font-body text-gray-700">Body Text - Body (16px)</p>
              <p className="text-sm font-body text-gray-600">Small Text - Body (14px)</p>
            </div>
          </section>

          {/* Font Features */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
              Font Features & Weights
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-display font-semibold text-gray-900 mb-3">
                  Poppins Weights
                </h3>
                <div className="space-y-2">
                  <p className="font-display font-normal">Regular (400)</p>
                  <p className="font-display font-medium">Medium (500)</p>
                  <p className="font-display font-semibold">Semibold (600)</p>
                  <p className="font-display font-bold">Bold (700)</p>
                  <p className="font-display font-extrabold">Extra Bold (800)</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-gray-900 mb-3">
                  Inter Weights
                </h3>
                <div className="space-y-2">
                  <p className="font-body font-light">Light (300)</p>
                  <p className="font-body font-normal">Regular (400)</p>
                  <p className="font-body font-medium">Medium (500)</p>
                  <p className="font-body font-semibold">Semibold (600)</p>
                  <p className="font-body font-bold">Bold (700)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Performance Notes */}
          <section className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-display font-bold text-blue-900 mb-3">
              Implementation Notes
            </h2>
            <ul className="space-y-2 text-sm font-body text-blue-800">
              <li>• Fonts are loaded via Google Fonts with preconnect for performance</li>
              <li>• Font-display: swap ensures text remains visible during font load</li>
              <li>• Comprehensive fallback chain maintains readability if fonts fail to load</li>
              <li>• Letter-spacing adjustments improve readability for larger text</li>
              <li>• OpenType features enabled for enhanced typography</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FontTest;