import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { analytics } from '../utils/analytics';

// Initial state
const initialState = {
  currentStep: 'overview',
  currentUser: null,
  sessionId: Math.random().toString(36).substring(7),
  startTime: Date.now(),
  showAuthModal: false,
  referralInfo: null,
  currentTestimonial: 0,
  isLoading: false
};

// Action types
const ActionTypes = {
  SET_STEP: 'SET_STEP',
  SET_USER: 'SET_USER',
  SET_AUTH_MODAL: 'SET_AUTH_MODAL',
  SET_REFERRAL_INFO: 'SET_REFERRAL_INFO',
  SET_TESTIMONIAL: 'SET_TESTIMONIAL',
  SET_LOADING: 'SET_LOADING',
  RESET_APP: 'RESET_APP'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_STEP:
      return { ...state, currentStep: action.payload };
    case ActionTypes.SET_USER:
      return { ...state, currentUser: action.payload };
    case ActionTypes.SET_AUTH_MODAL:
      return { ...state, showAuthModal: action.payload };
    case ActionTypes.SET_REFERRAL_INFO:
      return { ...state, referralInfo: action.payload };
    case ActionTypes.SET_TESTIMONIAL:
      return { ...state, currentTestimonial: action.payload };
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ActionTypes.RESET_APP:
      return {
        ...initialState,
        sessionId: Math.random().toString(36).substring(7),
        startTime: Date.now()
      };
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check for logged in user on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        dispatch({ type: ActionTypes.SET_USER, payload: JSON.parse(userData) });
      } catch (e) {
        // Invalid user data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // Initialize analytics
    analytics.init();
    
    // Track initial page load
    analytics.pageView('Landing Page');
    analytics.track('page_view', {
      page: 'overview',
      session_id: state.sessionId,
      timestamp: state.startTime
    });
  }, [state.sessionId, state.startTime]);

  // Check for referral parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    const utm_source = urlParams.get('utm_source');
    const utm_campaign = urlParams.get('utm_campaign');
    const utm_medium = urlParams.get('utm_medium');
    
    if (refCode) {
      // Mock referral data - replace with actual API call
      const mockReferralData = {
        code: refCode,
        referrerName: 'John Smith',
        bonus: 50,
        isValid: true
      };
      
      dispatch({ type: ActionTypes.SET_REFERRAL_INFO, payload: mockReferralData });
      
      // Track referral traffic
      analytics.referral('visit', refCode, {
        referrer_name: mockReferralData.referrerName,
        utm_source,
        utm_campaign,
        utm_medium,
        session_id: state.sessionId
      });
    }
    
    // Track UTM parameters for marketing attribution
    if (utm_source || utm_campaign) {
      analytics.track('utm_tracking', {
        utm_source: utm_source || 'direct',
        utm_campaign: utm_campaign || 'none',
        utm_medium: utm_medium || 'none',
        session_id: state.sessionId
      });
    }
  }, [state.sessionId]);

  // Actions
  const actions = {
    setStep: (step) => {
      dispatch({ type: ActionTypes.SET_STEP, payload: step });
      analytics.pageView(step === 'overview' ? 'Landing Page' : 
                        step === 'application' ? 'Application Form' : 'Thank You Page');
    },
    
    setUser: (user) => {
      dispatch({ type: ActionTypes.SET_USER, payload: user });
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    },
    
    setAuthModal: (show) => {
      dispatch({ type: ActionTypes.SET_AUTH_MODAL, payload: show });
    },
    
    setReferralInfo: (info) => {
      dispatch({ type: ActionTypes.SET_REFERRAL_INFO, payload: info });
    },
    
    setTestimonial: (index) => {
      dispatch({ type: ActionTypes.SET_TESTIMONIAL, payload: index });
    },
    
    setLoading: (loading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
    },
    
    resetApp: () => {
      dispatch({ type: ActionTypes.RESET_APP });
    },
    
    handleAuthSuccess: (data) => {
      actions.setUser(data.user);
      actions.setAuthModal(false);
      
      // If they have an application, redirect to dashboard
      if (data.application) {
        window.location.href = '/account';
      }
    }
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;