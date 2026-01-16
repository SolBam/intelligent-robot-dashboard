import React from 'react';

// className을 받아서 크기와 모양을 외부에서 결정하게 함
const Skeleton = ({ className, ...props }) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded-md ${className}`} 
      {...props} 
    />
  );
};

export default Skeleton;