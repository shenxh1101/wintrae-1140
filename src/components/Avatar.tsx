import React from 'react';
import { clsx } from 'clsx';

interface AvatarProps {
  src?: string;
  alt?: string;
  emoji?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  online?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  emoji,
  size = 'md',
  className,
  online,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-24 h-24 text-4xl',
  };

  return (
    <div className={clsx('relative inline-block', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={clsx(
            sizes[size],
            'rounded-full object-cover border-2 border-white shadow-card'
          )}
        />
      ) : emoji ? (
        <div
          className={clsx(
            sizes[size],
            'rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shadow-card border-2 border-white'
          )}
        >
          <span role="img" aria-label={alt}>
            {emoji}
          </span>
        </div>
      ) : (
        <div
          className={clsx(
            sizes[size],
            'rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-card border-2 border-white'
          )}
        >
          <span className="text-white font-bold text-lg">?</span>
        </div>
      )}
      {online !== undefined && (
        <div
          className={clsx(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
            online ? 'bg-success-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
};
