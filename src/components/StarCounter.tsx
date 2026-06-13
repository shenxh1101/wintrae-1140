import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

interface StarCounterProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
  className?: string;
}

export const StarCounter: React.FC<StarCounterProps> = ({
  count,
  size = 'md',
  showAnimation = false,
  className,
}) => {
  const [displayCount, setDisplayCount] = useState(showAnimation ? 0 : count);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showAnimation && count > 0) {
      setIsAnimating(true);
      let current = 0;
      const step = Math.ceil(count / 20);
      const interval = setInterval(() => {
        current += step;
        if (current >= count) {
          setDisplayCount(count);
          setIsAnimating(false);
          clearInterval(interval);
        } else {
          setDisplayCount(current);
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      setDisplayCount(count);
    }
  }, [count, showAnimation]);

  const sizes = {
    sm: {
      icon: 'w-4 h-4',
      text: 'text-sm',
      container: 'px-2 py-1',
    },
    md: {
      icon: 'w-5 h-5',
      text: 'text-base',
      container: 'px-3 py-1.5',
    },
    lg: {
      icon: 'w-6 h-6',
      text: 'text-xl',
      container: 'px-4 py-2',
    },
  };

  const config = sizes[size];

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full shadow-card',
        config.container,
        isAnimating && 'animate-pulse',
        className
      )}
    >
      <Star
        className={clsx(config.icon, 'text-yellow-900 fill-current')}
      />
      <span className={clsx(config.text, 'font-bold text-yellow-900')}>
        {displayCount}
      </span>
    </div>
  );
};
