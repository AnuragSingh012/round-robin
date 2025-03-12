import React, { useState, useEffect } from 'react';
import { getRestrictionTimeRemaining } from '@/utils/abusePreventionUtils';
import { Clock } from 'lucide-react';

const RestrictionCountdown: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState<number>(getRestrictionTimeRemaining());
  
  useEffect(() => {
    // Update the countdown every second
    const interval = setInterval(() => {
      const remaining = getRestrictionTimeRemaining();
      setTimeRemaining(remaining);
      
      // Clear interval if time is up
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (timeRemaining <= 0) {
    return null;
  }
  
  // Format time remaining
  const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
  const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
  
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    <div className="bg-secondary/70 p-4 rounded-md flex items-center space-x-3 mb-4 animate-pulse">
      <Clock className="text-primary h-5 w-5" />
      <div>
        <p className="text-sm font-medium">You've recently claimed a coupon</p>
        <p className="text-xs text-muted-foreground">You can claim again in <span className="font-mono font-medium">{formattedTime}</span></p>
      </div>
    </div>
  );
};

export default RestrictionCountdown;
