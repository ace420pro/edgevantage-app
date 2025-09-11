import React, { useEffect } from 'react';
import { Star } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useApp } from '../../contexts/AppContext';

const testimonials = [
  {
    name: "Sarah M.",
    location: "Texas",
    earnings: "$825",
    text: "Getting $825 every month has been life-changing. The setup was so easy and I literally don't think about it anymore. The money just shows up!",
    avatar: "👩‍💼"
  },
  {
    name: "Mike R.",
    location: "Florida", 
    earnings: "$750",
    text: "I was skeptical at first, but EdgeVantage has paid me consistently for 8 months now. Best decision I made this year. My wife thought I was crazy!",
    avatar: "👨‍💻"
  },
  {
    name: "Jennifer L.",
    location: "California",
    earnings: "$680",
    text: "The extra $680 per month covers my car payment. It's the easiest money I've ever made. I tell everyone about this opportunity.",
    avatar: "👩‍🎓"
  },
  {
    name: "David K.",
    location: "New York",
    earnings: "$920",
    text: "EdgeVantage changed my financial situation completely. $920 monthly for doing absolutely nothing after the initial setup. Amazing!",
    avatar: "👨‍🏫"
  },
  {
    name: "Lisa P.",
    location: "Arizona",
    earnings: "$775",
    text: "I love waking up to payment notifications! $775 every month like clockwork. The support team is fantastic too.",
    avatar: "👩‍🔬"
  },
  {
    name: "Robert J.",
    location: "Ohio",
    earnings: "$850",
    text: "Started 6 months ago and haven't looked back. $850 monthly has helped me save for my dream vacation. EdgeVantage delivers!",
    avatar: "👨‍⚕️"
  }
];

const TestimonialsCarousel = () => {
  const { currentTestimonial, setTestimonial, setStep } = useApp();

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonial((currentTestimonial + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [currentTestimonial, setTestimonial]);

  return (
    <Card className="mb-12 sm:mb-16">
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">What Our Members Say</h3>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="status-online"></div>
          <span className="text-gray-600 text-sm">Live member testimonials</span>
        </div>
      </div>
      
      <div className="relative max-w-4xl mx-auto">
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="w-full flex-shrink-0 px-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8">
                  <div className="text-center">
                    <div className="text-4xl mb-4">{testimonial.avatar}</div>
                    <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 text-lg sm:text-xl italic leading-relaxed mb-6">
                      "{testimonial.text}"
                    </blockquote>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="text-center">
                        <div className="font-bold text-gray-900 text-base sm:text-lg">
                          {testimonial.name}
                        </div>
                        <div className="text-gray-600 text-sm">{testimonial.location}</div>
                      </div>
                      <div className="w-px h-8 bg-gray-300"></div>
                      <div className="text-center">
                        <div className="font-bold text-green-600 text-lg sm:text-xl">
                          {testimonial.earnings}
                        </div>
                        <div className="text-gray-600 text-xs">monthly</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation dots */}
        <div className="flex justify-center space-x-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setTestimonial(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentTestimonial ? 'bg-purple-600 w-6' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        {/* Manual navigation arrows */}
        <button
          onClick={() => setTestimonial(currentTestimonial === 0 ? testimonials.length - 1 : currentTestimonial - 1)}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          ←
        </button>
        <button
          onClick={() => setTestimonial((currentTestimonial + 1) % testimonials.length)}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          →
        </button>
      </div>
      
      <div className="text-center mt-8">
        <Button
          variant="primary"
          onClick={() => setStep('application')}
        >
          Join These Success Stories
        </Button>
      </div>
    </Card>
  );
};

export default TestimonialsCarousel;