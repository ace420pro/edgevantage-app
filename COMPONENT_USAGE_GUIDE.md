# 🧩 EdgeVantage Components - Detailed Usage Guide

## 🎯 **Core Components**

### **1. App.js - Main Application Controller**
**Location:** `src/App.js`  
**Role:** Primary application orchestrator

**Key Functions:**
```javascript
// State Management
const [currentStep, setCurrentStep] = useState('overview');
const [formData, setFormData] = useState({...});

// Step Navigation
setCurrentStep('overview');     // Landing page
setCurrentStep('application');  // Form page  
setCurrentStep('confirmation'); // Success page

// Form Handling
handleInputChange(field, value); // Real-time validation
submitApplication();             // API submission
```

**How to Modify:**
- **Add new steps:** Update renderContent() switch statement
- **New form fields:** Add to formData state and validation
- **Styling changes:** Update Tailwind classes in JSX

---

### **2. AdminDashboard.js - Admin Interface**
**Location:** `src/AdminDashboard.js`  
**Access:** Ctrl+Shift+A on any page

**Features:**
```javascript
// Dashboard Data
const [dashboardData, setDashboardData] = useState({
  totalApplications: 0,
  qualifiedApplications: 0,
  recentApplications: [],
  stateDistribution: []
});

// API Calls
fetchDashboardData();    // Get statistics
updateLeadStatus(id);    // Change lead status
```

**Customization:**
- **New metrics:** Add to fetchDashboardData()
- **UI changes:** Modify dashboard cards
- **Filters:** Add date/status filters

**Usage Example:**
```javascript
// Access admin dashboard
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    setShowAdminDashboard(true);
  }
});
```

---

### **3. AuthModalEnhanced.js - Authentication System**
**Location:** `src/AuthModalEnhanced.js`

**Modes:**
```javascript
// Modal States
'login'    // User login
'register' // Account creation
'forgot'   // Password reset

// Usage
setAuthMode('login');
setShowAuthModal(true);
```

**Key Functions:**
```javascript
handleLogin(email, password);      // Authenticate user
handleRegister(name, email, pwd);  // Create account
handleForgotPassword(email);       // Send reset link
```

**Integration:**
```javascript
// Trigger from any component
<button onClick={() => {
  setAuthMode('login');
  setShowAuthModal(true);
}}>
  Login
</button>
```

---

### **4. UserDashboardEnhanced.js - User Portal**
**Location:** `src/UserDashboardEnhanced.js`

**Sections:**
```javascript
// Dashboard Components
ApplicationStatus    // Current application state
EarningsOverview    // Revenue tracking
EquipmentStatus     // Shipping & installation
ProfileSettings     // Account management
```

**Data Structure:**
```javascript
const userDashboardData = {
  application: {
    status: 'approved',
    qualified: true,
    submittedAt: '2024-01-15'
  },
  earnings: {
    totalEarned: 2500,
    currentMonthly: 750,
    nextPayment: '2024-02-01'
  },
  equipment: {
    shipped: true,
    delivered: false,
    trackingNumber: 'UPS123456'
  }
};
```

---

### **5. AffiliatePortal.js - Referral System**
**Location:** `src/AffiliatePortal.js`

**Core Features:**
```javascript
// Referral Management
generateReferralLink(userId);     // Create unique link
trackReferralClicks(code);        // Monitor engagement
calculateCommissions(referrals);  // Earnings calculation

// Link Format
const referralLink = `${window.location.origin}/?ref=${affiliateCode}`;
```

**Commission Structure:**
```javascript
const commissionRates = {
  standard: 50,        // $50 per successful referral
  tier1: 75,          // $75 for top performers
  tier2: 100          // $100 for VIP affiliates
};
```

---

## 🎨 **UI Components**

### **6. ChatWidget.js - Customer Support**
**Location:** `src/ChatWidget.js`

**Features:**
```javascript
// Chat States
'minimized'  // Small chat bubble
'expanded'   // Full chat interface
'typing'     // Show typing indicator

// Message Types
userMessage     // Customer input
botResponse     // Automated replies
agentMessage    // Live support
```

**Customization:**
```javascript
// Add new automated responses
const responses = {
  greeting: "Hi! How can I help you today?",
  hours: "We're available 9 AM - 5 PM EST",
  contact: "Call us at (817) 204-6783"
};
```

---

### **7. EducationHub.js - Learning Platform**
**Location:** `src/EducationHub.js`

**Course Structure:**
```javascript
const courseData = {
  id: 'course-001',
  title: 'Passive Income Mastery',
  description: 'Learn multiple income streams',
  price: 297,
  modules: [
    { title: 'Introduction', duration: 30 },
    { title: 'Setup Process', duration: 45 }
  ],
  instructor: {
    name: 'John Doe',
    credentials: ['MBA', 'Real Estate Expert']
  }
};
```

**Student Progress:**
```javascript
const enrollmentData = {
  courseId: 'course-001',
  progress: {
    completedModules: [0, 1],
    currentModule: 2,
    percentComplete: 75
  }
};
```

---

## 🔧 **API Integration Guide**

### **API Function Usage**

**Lead Management:**
```javascript
// Submit Application
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});

// Get Statistics  
const stats = await fetch('/api/leads-stats');
```

**Authentication:**
```javascript
// Login User
const loginResponse = await fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'login',
    email: 'user@example.com',
    password: 'password123'
  })
});
```

**User Dashboard:**
```javascript
// Get Dashboard Data
const dashboardData = await fetch('/api/user/dashboard', {
  headers: { 
    'Authorization': `Bearer ${userToken}` 
  }
});
```

---

## 📱 **Mobile Responsiveness**

### **Breakpoint System**
```css
/* Tailwind CSS Breakpoints */
sm:   640px+   /* Small tablets */
md:   768px+   /* Tablets */  
lg:   1024px+  /* Laptops */
xl:   1280px+  /* Desktops */
```

### **Mobile-First Components**
```javascript
// Responsive Form Fields
<input className="w-full px-4 py-3 sm:py-4 text-base sm:text-lg" />

// Responsive Grid
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

// Mobile Navigation
<div className="block lg:hidden"> {/* Mobile menu */}
<div className="hidden lg:block"> {/* Desktop menu */}
```

---

## 🎭 **Animation System**

### **Custom Animations**
```css
/* CSS Animations (in public/index.html) */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.9); }  
  to { opacity: 1; transform: scale(1); }
}
```

### **Usage in Components**
```javascript
// Apply Animations
<div className="animate-in">        {/* Fade in effect */}
<div className="zoom-in">          {/* Zoom in effect */}

// Tailwind Animations
<div className="transition-all duration-300 hover:scale-105">
```

---

## 🔍 **Analytics Integration**

### **Event Tracking**
```javascript
// Track Form Progress
trackFormProgress(stepNumber, percentComplete);

// Track Conversions
trackConversion('application_completed', 500);

// Custom Events
trackEvent('button_click', {
  button_name: 'get_started',
  page: 'landing'
});
```

### **Page Views**
```javascript
// Track Page Navigation
useEffect(() => {
  trackPageView('Application Form');
}, [currentStep]);
```

---

## 🛠️ **Development Workflow**

### **Adding New Components**

**1. Create Component File:**
```javascript
// src/NewComponent.js
import React, { useState } from 'react';
import { Icon } from 'lucide-react';

const NewComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  return (
    <div className="component-container">
      {/* Component JSX */}
    </div>
  );
};

export default NewComponent;
```

**2. Import in App.js:**
```javascript
import NewComponent from './NewComponent';

// Use in render
<NewComponent prop1={value1} prop2={value2} />
```

**3. Add Routes (if needed):**
```javascript
// For React Router
<Route path="/new-page" element={<NewComponent />} />
```

---

### **Adding API Endpoints**

**1. Create API Function:**
```javascript
// api/new-endpoint.js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Handle GET request
    res.json({ success: true, data: result });
  }
}
```

**2. Connect to Frontend:**
```javascript
// In React component
const fetchData = async () => {
  const response = await fetch('/api/new-endpoint');
  const data = await response.json();
};
```

---

## 🎯 **Best Practices**

### **Component Development**
- Use functional components with hooks
- Implement proper error boundaries
- Add loading states for async operations
- Follow consistent naming conventions

### **State Management**
- Keep state as local as possible
- Use context for global state
- Implement proper cleanup in useEffect

### **API Design**
- Use RESTful conventions
- Implement proper error handling
- Add request/response validation
- Include rate limiting

### **Performance**
- Lazy load non-critical components
- Optimize images and assets
- Use proper caching strategies
- Monitor bundle size

---

**🎉 This comprehensive guide covers all components and their usage patterns. Each section provides practical examples and implementation details for extending your EdgeVantage application!**