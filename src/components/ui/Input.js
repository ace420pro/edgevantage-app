import React from 'react';
import { AlertCircle } from 'lucide-react';

const Input = React.forwardRef(({
  label,
  error,
  required = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={error ? 'form-input-error' : `form-input ${className}`}
        {...props}
      />
      {error && (
        <div className="form-error">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;