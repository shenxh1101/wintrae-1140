import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface EncouragementBubbleProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'celebration';
}

export const EncouragementBubble: React.FC<EncouragementBubbleProps> = ({
  message,
  isVisible,
  onClose,
  type = 'success',
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !show) return null;

  return (
    <div
      className={clsx(
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-500',
        show ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      )}
    >
      <div
        className={clsx(
          'relative px-8 py-6 rounded-3xl shadow-2xl max-w-sm text-center',
          type === 'celebration'
            ? 'bg-gradient-to-br from-gold-400 via-yellow-300 to-gold-500'
            : 'bg-gradient-to-br from-primary-400 via-primary-300 to-primary-500'
        )}
      >
        <div className="absolute -top-2 -right-2">
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
        </div>

        <div className="text-6xl mb-4 animate-bounce">🎉</div>

        <p className="text-white text-xl font-bold leading-relaxed mb-4">
          {message}
        </p>

        <button
          onClick={() => {
            setShow(false);
            onClose();
          }}
          className="text-white/90 hover:text-white text-sm font-semibold underline"
        >
          知道了
        </button>
      </div>

      <div className="absolute inset-0 -z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={clsx(
              'absolute w-2 h-2 rounded-full animate-float',
              i % 2 === 0 ? 'bg-gold-300' : 'bg-white'
            )}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
