import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components';
import { useStore } from '../store';
import type { User } from '../types';
import { Crown, Baby } from 'lucide-react';
import { clsx } from 'clsx';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, setCurrentUser, setCurrentRole } = useStore();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const familyMembers = useMemo(() => users, [users]);

  const handleLogin = () => {
    if (!selectedUser) return;

    setCurrentUser(selectedUser);
    setCurrentRole(selectedUser.role);

    if (selectedUser.role === 'child') {
      navigate('/child/tasks');
    } else {
      navigate('/parent/tasks');
    }
  };

  const parents = familyMembers.filter((u) => u.role === 'parent');
  const children = familyMembers.filter((u) => u.role === 'child');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="text-8xl mb-4 animate-bounce">⭐</div>
        <h1 className="text-4xl font-bold text-gray-800 font-display mb-2">
          小星星成长记
        </h1>
        <p className="text-gray-600 text-lg">让好习惯陪伴孩子成长</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold text-gray-800">我是家长</h2>
          </div>
          <div className="space-y-2">
            {parents.map((parent) => (
              <button
                key={parent.id}
                onClick={() => setSelectedUser(parent)}
                className={clsx(
                  'w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3',
                  selectedUser?.id === parent.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 bg-white'
                )}
              >
                <span className="text-3xl">{parent.avatar}</span>
                <span className="font-semibold text-gray-800">{parent.name}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Baby className="w-5 h-5 text-secondary-500" />
            <h2 className="text-lg font-bold text-gray-800">我是小朋友</h2>
          </div>
          <div className="space-y-2">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedUser(child)}
                className={clsx(
                  'w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3',
                  selectedUser?.id === child.id
                    ? 'border-secondary-500 bg-secondary-50'
                    : 'border-gray-200 hover:border-secondary-300 bg-white'
                )}
              >
                <span className="text-3xl">{child.avatar}</span>
                <span className="font-semibold text-gray-800">{child.name}</span>
                <span className="ml-auto text-gold-600 font-bold">⭐ {child.stars}</span>
              </button>
            ))}
            {children.length === 0 && (
              <p className="text-gray-500 py-4">暂无可用成员，请联系管理员</p>
            )}
          </div>
        </Card>

        <Button
          onClick={handleLogin}
          disabled={!selectedUser}
          className="w-full text-lg py-4"
          size="lg"
        >
          开始使用 🌟
        </Button>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>选择角色进入应用</p>
        <p className="mt-1">家长可以管理任务和奖励</p>
        <p>孩子可以打卡和兑换奖励</p>
      </div>
    </div>
  );
};
