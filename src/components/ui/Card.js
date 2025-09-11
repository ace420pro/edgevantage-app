import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = true, 
  hover = true,
  ...props 
}) => {
  const classes = [
    'card',
    padding && 'card-padding',
    hover && 'hover:shadow-xl',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;