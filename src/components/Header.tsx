import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { Avatar } from './Avatar';
import { StarCounter } from './StarCounter';
import type { User } from '../types';
import { clsx } from 'clsx';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  user?: User;
  showStars?: boolean;
  showNotification?: boolean;
  onNotificationClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  user,
  showStars = false,
  showNotification = false,
  onNotificationClick,
  className,
  children,
}) => {
  const navigate = useNavigate();

  return (
    <header
      className={clsx(
        'sticky top-0 bg-white border-b border-gray-100 z-30',
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {showBack ? (
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            ) : (
              <div className="text-3xl">⭐</div>
            )}

            {title && (
              <h1 className="font-bold text-xl text-gray-800 font-display">
                {title}
              </h1>
            )}

            {children}
          </div>

          <div className="flex items-center gap-3">
            {showStars && user && (
              <StarCounter count={user.stars} size="md" />
            )}

            {showNotification && (
              <button
                onClick={onNotificationClick}
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            )}

            {user && <Avatar emoji={user.avatar} size="md" />}
          </div>
        </div>
      </div>
    </header>
  );
};
