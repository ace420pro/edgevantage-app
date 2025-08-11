import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Send, User, Bot, ChevronDown, 
  Search, HelpCircle, DollarSign, Clock, Shield,
  Home, Wifi, Phone, Mail, Award, ArrowRight, Minimize2
} from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeView, setActiveView] = useState('welcome'); // welcome, faq, chat
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);

  // FAQ data
  const faqCategories = [
    {
      name: 'Getting Started',
      icon: HelpCircle,
      questions: [
        {
          q: 'What is EdgeVantage?',
          a: 'EdgeVantage is a passive income opportunity where you earn $500-$1000 monthly by hosting our specialized equipment at your residence. You provide the space and internet, we handle everything else.'
        },
        {
          q: 'How do I qualify?',
          a: 'You need: 1) A US residence with proof, 2) Reliable internet connection, and 3) Space for our equipment. Complete our simple application to get started.'
        },
        {
          q: 'How long does the application process take?',
          a: 'Most applications are reviewed within 24-48 hours. Once approved, equipment typically ships within 5-7 business days.'
        },
        {
          q: 'Is this really passive income?',
          a: 'Yes! After initial setup (which takes about 30 minutes), you earn monthly payments automatically with no ongoing work required.'
        }
      ]
    },
    {
      name: 'Earnings & Payments',
      icon: DollarSign,
      questions: [
        {
          q: 'How much can I earn?',
          a: 'Most members earn $500-$1000 per month. Your exact amount depends on your location, internet speed, and equipment type assigned to you.'
        },
        {
          q: 'When do I get paid?',
          a: 'Payments are made monthly via direct deposit. Your first payment starts the month after your equipment goes live.'
        },
        {
          q: 'Are there any costs or fees?',
          a: 'No! There are no upfront costs, monthly fees, or hidden charges. We even cover shipping and provide all equipment free.'
        },
        {
          q: 'What happens if equipment breaks?',
          a: 'We provide free replacement equipment and technical support. You\'re never responsible for equipment costs or repairs.'
        }
      ]
    },
    {
      name: 'Technical Requirements',
      icon: Wifi,
      questions: [
        {
          q: 'What internet speed do I need?',
          a: 'Minimum 25 Mbps download and 5 Mbps upload. Our equipment uses very little bandwidth and won\'t slow down your internet.'
        },
        {
          q: 'How much space does the equipment take?',
          a: 'About the size of a cable box (8" x 6" x 2"). It needs to be placed near your router with access to power and ethernet.'
        },
        {
          q: 'Will it affect my electric bill?',
          a: 'The equipment uses about $3-5 worth of electricity per month. Your monthly earnings far exceed any utility costs.'
        },
        {
          q: 'Can I use Wi-Fi instead of ethernet?',
          a: 'Ethernet connection is required for optimal performance and stability. Most setups are within 10 feet of your router.'
        }
      ]
    },
    {
      name: 'Application & Setup',
      icon: Home,
      questions: [
        {
          q: 'What documents do I need?',
          a: 'You\'ll need proof of US residence (utility bill, lease, or mortgage statement) and a valid email address. That\'s it!'
        },
        {
          q: 'Can I apply if I rent my home?',
          a: 'Yes! Renters are welcome. The equipment is small and doesn\'t require any modifications to your home.'
        },
        {
          q: 'How long does setup take?',
          a: 'About 30 minutes. We provide step-by-step instructions and video guides. Our support team helps if needed.'
        },
        {
          q: 'What if I need to move?',
          a: 'Just let us know! We can either ship equipment to your new address or arrange pickup. Your earnings continue seamlessly.'
        }
      ]
    },
    {
      name: 'Support & Security',
      icon: Shield,
      questions: [
        {
          q: 'Is this legitimate and safe?',
          a: 'Absolutely! EdgeVantage is a registered business. Our equipment is FCC certified and uses bank-level security protocols.'
        },
        {
          q: 'How do I contact support?',
          a: 'Email support@edgevantagepro.com, call 1-800-EDGE-VAN, or use this live chat. We respond within 2 hours during business days.'
        },
        {
          q: 'Can I cancel anytime?',
          a: 'Yes! There are no contracts or cancellation fees. Simply request equipment pickup and you\'re done. You keep all earnings made.'
        },
        {
          q: 'What data does the equipment access?',
          a: 'None of your personal data. The equipment operates on an isolated network segment and only processes our business data.'
        }
      ]
    }
  ];

  // Common chatbot responses
  const botResponses = {
    greetings: [
      "Hi there! 👋 I'm here to help you learn about EdgeVantage's passive income opportunity. What questions do you have?",
      "Welcome! I can help you understand how you can earn $500-$1000 monthly with EdgeVantage. What would you like to know?",
      "Hello! Ready to learn about earning passive income with EdgeVantage? I'm here to answer your questions!"
    ],
    apply: [
      "Great choice! You can start your application by clicking the 'Apply Now' button on this page. It only takes 2-3 minutes! 🚀",
      "Ready to apply? Click 'Apply Now' above and complete our quick 3-step process. Most people get approved within 24 hours! ⚡"
    ],
    earnings: [
      "Most EdgeVantage members earn $500-$1000 per month passively. Your exact amount depends on location and internet speed. Want to see if you qualify? 💰",
      "Our members typically earn $742/month on average. Some earn up to $1000+ depending on their setup. Ready to start your application? 📈"
    ],
    requirements: [
      "You need: 1️⃣ US residence, 2️⃣ Reliable internet (25+ Mbps), 3️⃣ Space for small equipment. That's it! Want to check if you qualify?",
      "Just three simple requirements: US home, good internet, and space near your router. Most people qualify easily! 🏠"
    ],
    default: [
      "I'm not sure about that specific question, but I'd be happy to help! You can browse our FAQ or chat with a human agent. What else can I help with?",
      "Let me connect you with more specific information. Check out our FAQ categories below, or would you like to speak with a human agent?",
      "Good question! For detailed answers, browse our FAQ sections or contact our human support team. How else can I assist you today?"
    ]
  };

  const quickActions = [
    { text: 'How much can I earn?', action: 'earnings' },
    { text: 'What do I need to qualify?', action: 'requirements' },
    { text: 'How do I apply?', action: 'apply' },
    { text: 'Is this legitimate?', action: 'safety' },
    { text: 'View FAQ', action: 'faq' },
    { text: 'Speak to human', action: 'human' }
  ];

  useEffect(() => {
    if (messages.length === 0) {
      // Initial greeting
      setTimeout(() => {
        setMessages([{
          id: 1,
          type: 'bot',
          content: getRandomResponse('greetings'),
          timestamp: new Date()
        }]);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasUnread(true);
    } else if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRandomResponse = (type) => {
    const responses = botResponses[type] || botResponses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('earn') || lowerMessage.includes('money') || lowerMessage.includes('much')) {
      return getRandomResponse('earnings');
    }
    if (lowerMessage.includes('apply') || lowerMessage.includes('start') || lowerMessage.includes('sign up')) {
      return getRandomResponse('apply');
    }
    if (lowerMessage.includes('qualify') || lowerMessage.includes('requirements') || lowerMessage.includes('need')) {
      return getRandomResponse('requirements');
    }
    if (lowerMessage.includes('safe') || lowerMessage.includes('legit') || lowerMessage.includes('scam')) {
      return "EdgeVantage is 100% legitimate! We're a registered business with thousands of successful members. Our equipment is FCC certified and we use bank-level security. You can verify our credentials anytime. 🛡️";
    }
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return getRandomResponse('greetings');
    }
    if (lowerMessage.includes('human') || lowerMessage.includes('agent') || lowerMessage.includes('person')) {
      return "I'll connect you with a human agent right now! They typically respond within 2 hours during business hours. You can also email support@edgevantagepro.com or call 1-800-EDGE-VAN. 👥";
    }
    
    return getRandomResponse('default');
  };

  const handleQuickAction = (action) => {
    let response;
    switch (action) {
      case 'earnings':
        response = getRandomResponse('earnings');
        break;
      case 'requirements':
        response = getRandomResponse('requirements');
        break;
      case 'apply':
        response = getRandomResponse('apply');
        break;
      case 'safety':
        response = "EdgeVantage is completely legitimate and safe! We're a registered business with FCC-certified equipment, bank-level security, and thousands of happy members earning monthly. Want to see our credentials?";
        break;
      case 'faq':
        setActiveView('faq');
        return;
      case 'human':
        response = "Connecting you with a human agent... They'll respond within 2 hours during business hours. For immediate help, call 1-800-EDGE-VAN or email support@edgevantagepro.com 👥";
        break;
      default:
        response = getRandomResponse('default');
    }

    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'bot',
      content: response,
      timestamp: new Date()
    }]);
  };

  const handleFAQClick = (question) => {
    setMessages(prev => [...prev, 
      {
        id: Date.now(),
        type: 'user',
        content: question.q,
        timestamp: new Date()
      },
      {
        id: Date.now() + 1,
        type: 'bot',
        content: question.a,
        timestamp: new Date()
      }
    ]);
    setActiveView('chat');
  };

  const renderWelcomeView = () => (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Hi! I'm your EdgeVantage assistant</h3>
        <p className="text-gray-600 text-sm">I can help answer questions about earning $500-$1000/month passive income.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action.action)}
            className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            {action.text}
          </button>
        ))}
      </div>

      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setActiveView('chat')}
          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          Start Chat
        </button>
        <button
          onClick={() => setActiveView('faq')}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          Browse FAQ
        </button>
      </div>
    </div>
  );

  const renderFAQView = () => (
    <div className="h-80 overflow-y-auto">
      <div className="p-4 border-b">
        <button
          onClick={() => setActiveView('welcome')}
          className="text-blue-600 text-sm mb-2"
        >
          ← Back to menu
        </button>
        <h3 className="font-bold text-gray-900">Frequently Asked Questions</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <div className="flex items-center mb-2">
              <category.icon className="w-4 h-4 text-purple-600 mr-2" />
              <h4 className="font-semibold text-gray-900 text-sm">{category.name}</h4>
            </div>
            <div className="space-y-2 ml-6">
              {category.questions.map((question, questionIndex) => (
                <button
                  key={questionIndex}
                  onClick={() => handleFAQClick(question)}
                  className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded"
                >
                  {question.q}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChatView = () => (
    <>
      <div className="flex-1 p-4 overflow-y-auto space-y-3" style={{ maxHeight: '320px' }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
              message.type === 'user' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              {message.type === 'bot' && (
                <div className="flex items-center mb-1">
                  <Bot className="w-3 h-3 text-purple-600 mr-1" />
                  <span className="text-xs text-gray-500">EdgeVantage Bot</span>
                </div>
              )}
              {message.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center">
                <Bot className="w-3 h-3 text-purple-600 mr-1" />
                <span className="text-xs text-gray-500 mr-2">EdgeVantage Bot</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about earning passive income..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 text-sm"
          />
          <button
            onClick={handleSendMessage}
            className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {['Apply now', 'How much?', 'Requirements'].map((quickText, index) => (
            <button
              key={index}
              onClick={() => {
                setInputMessage(quickText);
                setTimeout(handleSendMessage, 100);
              }}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
            >
              {quickText}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 relative"
        >
          <MessageCircle className="w-6 h-6" />
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">!</span>
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-2xl border transition-all ${
        isMinimized ? 'w-80 h-12' : 'w-80 h-96'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">EdgeVantage Assistant</h3>
              <p className="text-xs opacity-90">Online now</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="h-80 flex flex-col">
            {activeView === 'welcome' && renderWelcomeView()}
            {activeView === 'faq' && renderFAQView()}
            {activeView === 'chat' && renderChatView()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;