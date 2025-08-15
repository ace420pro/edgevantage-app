# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EdgeVantage is a lead management application for a passive income opportunity service. It consists of a React frontend and Express.js/MongoDB backend that handles application submissions, analytics tracking, and admin dashboard functionality.

**Key Business Logic:** The application presents a passive income opportunity where users can earn $500-$1000/month by hosting equipment at their residence. Users must qualify by having a US residence, internet access, and space for equipment.

## Architecture

### Frontend (React SPA)
- **Location:** `src/`
- **Main Component:** `src/App.js` - Single-page application with step-based flow
- **UI Framework:** Tailwind CSS (loaded via CDN in `public/index.html`)
- **Icons:** Lucide React icons
- **State Management:** React useState hooks for form data and application flow

### Backend (Express.js API)
- **Location:** `backend/`
- **Main Server:** `backend/server.js` - RESTful API with MongoDB integration
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** No authentication system (public API)

### Database Schema (MongoDB)
The Lead schema (`backend/server.js:26-127`) includes:
- Personal information (name, email, phone, location)
- Qualification answers (hasResidence, hasInternet, hasSpace)
- Referral tracking (referralSource, referralCode)
- Analytics data (sessionId, ipAddress, UTM parameters)
- Admin fields (status, monthlyEarnings, equipment tracking)

## Development Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server (React)
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start backend server
npm start

# Start backend with auto-restart (development)
npm run dev
```

## Key Features & Components

### Application Flow (3 Steps)
1. **Overview Page** (`currentStep === 'overview'`) - Landing page with marketing content
2. **Application Form** (`currentStep === 'application'`) - Qualification questions + contact form
3. **Confirmation Page** (`currentStep === 'confirmation'`) - Thank you page with next steps

### Qualification Logic
Users must answer "yes" to all three qualification questions:
- `hasResidence` - US residence with proof
- `hasInternet` - Reliable internet access
- `hasSpace` - Space for equipment

### Analytics Integration
Comprehensive tracking implemented in `src/App.js`:
- Google Analytics 4 via `gtag`
- Facebook Pixel via `fbq`
- Custom event tracking for form interactions, conversions, and user behavior
- UTM parameter tracking for marketing attribution

### Admin Dashboard
- **Access:** Ctrl+Shift+A keyboard shortcut
- **Features:** Application stats, recent submissions, state distribution
- **Data:** Mock data in frontend, real data available via `/api/leads` endpoint

### Referral System
- URL parameter tracking (`?ref=CODE`)
- Automatic form pre-filling
- $50 bonus for successful referrals
- Referral link generation on confirmation page

## API Endpoints

### Core Endpoints
- `POST /api/leads` - Submit new application
- `GET /api/leads` - Get all leads (with filtering)
- `GET /api/leads/stats` - Get application statistics
- `PATCH /api/leads/:id` - Update lead status
- `DELETE /api/leads/:id` - Delete lead
- `GET /api/referral/:code` - Check referral code validity
- `GET /api/health` - Health check

### Environment Configuration
- **Database:** MongoDB connection string in `backend/.env`
- **Port:** Configurable via `PORT` environment variable (defaults to 5000)

## Important Considerations

### Security Notes
- The `.env` file contains MongoDB credentials and should never be committed
- No authentication system exists - all endpoints are publicly accessible
- Input validation exists for email/phone formats

### Form Validation
- Real-time validation with error display
- Email format validation using regex
- Phone number validation for US formats
- Required field checking before submission

### Mobile Responsiveness
The application is fully responsive with:
- Mobile-first design approach
- Responsive grid layouts (`grid-cols-1 lg:grid-cols-3`)
- Mobile-optimized text sizes (`text-base sm:text-lg`)
- Touch-friendly button sizing

### Analytics & Tracking
Heavy emphasis on conversion tracking:
- Form progress tracking at each step
- User behavior analytics (scroll depth, time on page)
- Email capture popups with triggers
- UTM campaign attribution
- Referral source tracking

## Common Development Tasks

### Adding New Qualification Questions
1. Add new field to `formData` state in `App.js`
2. Update `canProceedToApplication()` logic
3. Add validation in `validateForm()` function
4. Update Lead schema in `backend/server.js`

### Modifying Analytics Events
1. Update tracking calls in relevant event handlers
2. Ensure both GA4 and Facebook Pixel receive events
3. Update custom parameters in `public/index.html` config

### Database Schema Changes
1. Update Lead schema in `backend/server.js`
2. Add/update indexes for query performance
3. Test aggregation pipelines in `/api/leads/stats` endpoint

### Styling Updates
1. Use Tailwind CSS classes directly in JSX
2. Custom animations defined in `public/index.html`
3. Responsive breakpoints: `sm:` (640px+), `lg:` (1024px+)