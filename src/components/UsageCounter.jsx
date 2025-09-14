import React, { useState, useEffect } from 'react';
import { getUsageLimit, getWarningThreshold } from '../config/appConfig';

const UsageCounter = ({ usageCount, hasReachedLimit, getEffectiveUsageLimit }) => {
  const [displayCount, setDisplayCount] = useState(usageCount);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (displayCount !== usageCount) {
      setIsAnimating(true);
      
      // Smooth transition animation
      const timer = setTimeout(() => {
        setDisplayCount(usageCount);
        setIsAnimating(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [usageCount, displayCount]);

  const getCounterColor = () => {
    if (hasReachedLimit) {
      return 'text-red-500';
    } else if (displayCount >= getWarningThreshold()) {
      return 'text-yellow-500';
    }
    return 'text-green-500';
  };

  const getProgressDots = () => {
    const dots = [];
    const effectiveLimit = getEffectiveUsageLimit ? getEffectiveUsageLimit() : getUsageLimit();
    for (let i = 0; i < effectiveLimit; i++) {
      const isUsed = i < displayCount;
      const isCurrent = i === displayCount - 1;
      
      dots.push(
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            isUsed 
              ? 'bg-indigo-500' 
              : 'bg-gray-300'
          } ${
            isCurrent && isAnimating 
              ? 'scale-125 shadow-lg' 
              : 'scale-100'
          }`}
        />
      );
    }
    return dots;
  };

  return (
    <div className="flex flex-col items-center space-y-2 mb-6">
      {/* Usage Counter Text */}
      <div className="flex items-center space-x-2">
        <span className={`text-lg font-semibold transition-colors duration-300 ${getCounterColor()}`}>
          {displayCount}/{getEffectiveUsageLimit ? getEffectiveUsageLimit() : getUsageLimit()} uses
        </span>
        {hasReachedLimit && (
          <span className="text-xs text-red-500 font-medium">
            (Limit reached)
          </span>
        )}
      </div>

      {/* Progress Dots */}
      <div className="flex items-center space-x-2">
        {getProgressDots()}
      </div>

      {/* Usage Status */}
      <div className="text-center">
        {hasReachedLimit ? (
          <p className="text-sm text-red-600 font-medium">
            You've used all your free generations
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            {(getEffectiveUsageLimit ? getEffectiveUsageLimit() : getUsageLimit()) - displayCount} generation{(getEffectiveUsageLimit ? getEffectiveUsageLimit() : getUsageLimit()) - displayCount !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>
    </div>
  );
};

export default UsageCounter;
