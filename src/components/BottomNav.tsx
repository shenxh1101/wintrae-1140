import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, TrendingUp, Users, ClipboardList, Gift, Settings } from 'lucide-react';
import { clsx } from 'clsx';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavProps {
  role: 'parent' | 'child';
}

export const BottomNav: React.FC<BottomNavProps> = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const childNavItems: NavItem[] = [
    { path: '/child/tasks', label: '任务', icon: <ClipboardList className="w-6 h-6" /> },
    { path: '/child/shop', label: '商店', icon: <ShoppingCart className="w-6 h-6" /> },
    { path: '/child/growth', label: '成长', icon: <TrendingUp className="w-6 h-6" /> },
    { path: '/child/family', label: '家庭', icon: <Users className="w-6 h-6" /> },
  ];

  const parentNavItems: NavItem[] = [
    { path: '/parent/tasks', label: '任务', icon: <ClipboardList className="w-6 h-6" /> },
    { path: '/parent/rewards', label: '奖励', icon: <Gift className="w-6 h-6" /> },
    { path: '/parent/approve', label: '审批', icon: <Star className="w-6 h-6" /> },
    { path: '/parent/settings', label: '设置', icon: <Settings className="w-6 h-6" /> },
  ];

  const navItems = role === 'child' ? childNavItems : parentNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg safe-bottom z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={clsx(
                  'flex flex-col items-center justify-center py-2 px-4 transition-all duration-200 touch-target',
                  isActive
                    ? 'text-primary-500 scale-110'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <div
                  className={clsx(
                    'p-2 rounded-xl transition-all duration-200',
                    isActive && 'bg-primary-50'
                  )}
                >
                  {item.icon}
                </div>
                <span className="text-xs font-semibold mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
