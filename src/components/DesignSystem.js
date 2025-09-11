import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, AlertCircle, CheckCircle, Loader2, X, Check } from 'lucide-react';

// Accessibility-first design system for EdgeVantage
// WCAG 2.1 AA compliant components

// Button Component - Accessible with proper focus management
export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  onClick,
  ariaLabel,
  ariaDescribedBy,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border border-transparent';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:shadow-lg hover:scale-105 focus:ring-blue-500 disabled:hover:scale-100',
    secondary: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 shadow-sm',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    warning: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]', // 36px minimum for accessibility
    md: 'px-6 py-3 text-base min-h-[44px]', // 44px WCAG recommended
    lg: 'px-8 py-4 text-lg min-h-[48px]'
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
};

// Input Component - Accessible with proper labeling and validation
export const Input = ({ 
  id,
  label, 
  type = 'text', 
  value, 
  onChange, 
  onBlur,
  placeholder, 
  error, 
  required = false,
  disabled = false,
  className = '',
  helpText,
  autoComplete,
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-semibold text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base min-h-[44px] ${
          error 
            ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-400' 
            : 'border-gray-300 focus:border-blue-500'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
        {...props}
      />
      
      {helpText && (
        <p id={helpId} className="text-sm text-gray-600">
          {helpText}
        </p>
      )}
      
      {error && (
        <div id={errorId} className="flex items-center mt-2 text-red-600 text-sm" role="alert">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Select Component - Accessible dropdown with keyboard navigation
export const Select = ({ 
  id,
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select an option",
  error, 
  required = false,
  disabled = false,
  className = '',
  helpText,
  ...props 
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${selectId}-error`;
  const helpId = `${selectId}-help`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-sm font-semibold text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base min-h-[44px] appearance-none bg-white ${
            error 
              ? 'border-red-500 bg-red-50 text-red-900' 
              : 'border-gray-300 focus:border-blue-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
      </div>
      
      {helpText && (
        <p id={helpId} className="text-sm text-gray-600">
          {helpText}
        </p>
      )}
      
      {error && (
        <div id={errorId} className="flex items-center mt-2 text-red-600 text-sm" role="alert">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Checkbox Component - Accessible with proper focus management
export const Checkbox = ({ 
  id,
  label, 
  checked, 
  onChange, 
  error, 
  disabled = false,
  className = '',
  description,
  ...props 
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${checkboxId}-error`;
  const descId = `${checkboxId}-desc`;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="relative flex-shrink-0 mt-1">
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${error ? errorId : ''} ${description ? descId : ''}`.trim() || undefined}
            {...props}
          />
          {checked && (
            <Check className="absolute top-0 left-0 w-5 h-5 text-white pointer-events-none" aria-hidden="true" />
          )}
        </div>
        
        <div className="flex-1">
          <label 
            htmlFor={checkboxId} 
            className={`block text-sm font-medium cursor-pointer ${
              disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
            }`}
          >
            {label}
          </label>
          
          {description && (
            <p id={descId} className="text-xs text-gray-600 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <div id={errorId} className="flex items-center text-red-600 text-sm" role="alert">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// RadioGroup Component - Accessible radio button group with proper ARIA
export const RadioGroup = ({ 
  name,
  label, 
  value, 
  onChange, 
  options = [], 
  error, 
  required = false,
  disabled = false,
  className = '',
  orientation = 'vertical',
  helpText,
  ...props 
}) => {
  const groupId = `radiogroup-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${groupId}-error`;
  const helpId = `${groupId}-help`;

  return (
    <fieldset className={`space-y-3 ${className}`} {...props}>
      {label && (
        <legend className="text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </legend>
      )}
      
      {helpText && (
        <p id={helpId} className="text-sm text-gray-600">
          {helpText}
        </p>
      )}
      
      <div 
        role="radiogroup"
        aria-labelledby={label ? `${groupId}-legend` : undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
        className={`space-y-3 ${orientation === 'horizontal' ? 'sm:flex sm:space-y-0 sm:space-x-4' : ''}`}
      >
        {options.map((option, index) => {
          const optionId = `${groupId}-option-${index}`;
          return (
            <label 
              key={option.value}
              htmlFor={optionId}
              className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all font-medium text-sm min-h-[44px] ${
                value === option.value 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                id={optionId}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                required={required}
                className="sr-only"
              />
              
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 flex items-center justify-center ${
                value === option.value 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
              }`}>
                {value === option.value && (
                  <div className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="font-semibold">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                )}
              </div>
              
              {option.icon && (
                <div className="ml-2 text-lg" aria-hidden="true">{option.icon}</div>
              )}
            </label>
          );
        })}
      </div>
      
      {error && (
        <div id={errorId} className="flex items-center text-red-600 text-sm" role="alert">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </fieldset>
  );
};

// ProgressBar Component - Accessible progress indication
export const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  label,
  showPercentage = true,
  size = 'md',
  color = 'blue',
  className = '',
  ...props 
}) => {
  const percentage = Math.round((value / max) * 100);
  const progressId = `progress-${Math.random().toString(36).substr(2, 9)}`;
  
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const colors = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600'
  };

  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="font-medium text-gray-700">{label}</span>}
          {showPercentage && <span className="text-gray-600">{percentage}%</span>}
        </div>
      )}
      
      <div 
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={label ? progressId : undefined}
      >
        <div 
          className={`${colors[color]} ${sizes[size]} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

// LoadingSpinner Component - Accessible loading indicator
export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue',
  label = 'Loading...',
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  const colors = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  };

  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      <Loader2 
        className={`animate-spin ${sizes[size]} ${colors[color]}`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

// Card Component - Accessible container with proper focus management
export const Card = ({ 
  children, 
  className = '',
  padding = 'md',
  shadow = 'md',
  interactive = false,
  onClick,
  as = 'div',
  ...props 
}) => {
  const Component = as;
  
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadows = {
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl'
  };

  const baseClasses = `bg-white rounded-2xl border border-gray-200 ${paddings[padding]} ${shadows[shadow]}`;
  const interactiveClasses = interactive 
    ? 'cursor-pointer hover:shadow-xl transition-shadow duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none' 
    : '';

  return (
    <Component
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      {...props}
    >
      {children}
    </Component>
  );
};

// Alert Component - Accessible notification with proper ARIA roles
export const Alert = ({ 
  type = 'info', 
  title, 
  children, 
  closable = false,
  onClose,
  className = '',
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  const types = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: CheckCircle,
      iconColor: 'text-emerald-600'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      icon: AlertCircle,
      iconColor: 'text-orange-600'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: AlertCircle,
      iconColor: 'text-blue-600'
    }
  };
  
  const config = types[type];
  const Icon = config.icon;
  
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  
  if (!isVisible) return null;

  return (
    <div 
      className={`${config.bg} ${config.border} ${config.text} border rounded-xl p-4 ${className}`}
      role="alert"
      aria-live="polite"
      {...props}
    >
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} aria-hidden="true" />
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-semibold mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        
        {closable && (
          <button
            onClick={handleClose}
            className={`ml-3 ${config.iconColor} hover:opacity-75 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none rounded`}
            aria-label="Close alert"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default {
  Button,
  Input,
  Select,
  Checkbox,
  RadioGroup,
  ProgressBar,
  LoadingSpinner,
  Card,
  Alert
};