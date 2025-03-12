import React from 'react';
import { cn } from '@/lib/utils';

type AnimatedIconProps = {
  icon: React.ReactNode;
  animation?: 'pulse' | 'bounce' | 'rotate' | 'float' | 'shake' | 'none';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const AnimatedIcon = ({ 
  icon, 
  animation = 'none', 
  size = 'md',
  className 
}: AnimatedIconProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const animationClasses = {
    pulse: 'animate-pulse-subtle',
    bounce: 'animate-bounce-subtle',
    rotate: 'animate-rotate-360',
    float: 'animate-float',
    shake: 'animate-[wiggle_1s_ease-in-out_infinite]',
    none: '',
  };

  return (
    <div 
      className={cn(
        'flex items-center justify-center',
        sizeClasses[size],
        animationClasses[animation],
        className
      )}
    >
      {icon}
    </div>
  );
};

export default AnimatedIcon;
