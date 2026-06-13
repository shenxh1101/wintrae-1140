import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Header,
  BottomNav,
  Card,
  Avatar,
  Badge,
  Button,
  Modal,
} from '../components';
import { useStore } from '../store';
import {
  Users,
  Trophy,
  Plus,
  Copy,
  Sparkles,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

export const ChildFamilyPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    family,
    users,
    challenges,
    setCurrentUser,
  } = useStore();

  const [showChallengeModal, setShowChallengeModal] = useState(false);

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const familyMembers = users.filter((u) => u.familyId === family.id);
  const activeChallenges = challenges.filter((c) => c.isActive);

  const handleSwitchUser = (user: typeof currentUser) => {
    if (user) {
      setCurrentUser(user);
      if (user.role === 'child') {
        navigate('/child/tasks');
      } else {
        navigate('/parent/tasks');
      }
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(family.inviteCode);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="家庭" user={currentUser} showStars />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{family.avatar}</div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{family.name}</h2>
              <p className="text-white/80 text-sm">邀请码: {family.inviteCode}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={copyInviteCode}
            className="w-full bg-white/20 text-white hover:bg-white/30 border-2 border-white/30"
          >
            <Copy className="w-4 h-4 mr-2" />
            复制邀请码
          </Button>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-800">家庭成员</h3>
            </div>
            <span className="text-sm text-gray-600">
              {familyMembers.length} 人
            </span>
          </div>

          <div className="space-y-3">
            {familyMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSwitchUser(member)}
                className={clsx(
                  'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
                  member.id === currentUser.id
                    ? 'bg-primary-50 border-2 border-primary-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                )}
              >
                <Avatar emoji={member.avatar} size="md" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800 flex items-center gap-2">
                    {member.name}
                    {member.id === currentUser.id && (
                      <Badge variant="primary" size="sm">当前</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {member.role === 'parent' ? '家长' : '小朋友'}
                  </div>
                </div>
                {member.role === 'child' && (
                  <Badge variant="gold" size="sm">
                    ⭐ {member.stars}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold-500" />
              <h3 className="font-bold text-gray-800">临时挑战</h3>
            </div>
            <Badge variant="secondary">{activeChallenges.length} 个进行中</Badge>
          </div>

          {activeChallenges.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-gray-600">暂无可用挑战</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">🏆</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">
                        {challenge.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {challenge.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <Badge variant="gold" size="sm">
                          ⭐ +{challenge.starReward}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(challenge.startDate).toLocaleDateString()} -{' '}
                          {new Date(challenge.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="text-5xl">💬</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-1">鼓励语</h3>
              <p className="text-sm text-gray-600">
                爸爸妈妈设置的鼓励语会在这里显示
              </p>
            </div>
          </div>
        </Card>

        <Card
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 cursor-pointer hover:shadow-card-hover"
          onClick={() => navigate('/child/growth')}
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">📊</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-1">查看成长报告</h3>
              <p className="text-sm text-gray-600">
                周报、月报和成就统计
              </p>
            </div>
            <Sparkles className="w-6 h-6 text-green-600" />
          </div>
        </Card>
      </div>

      <BottomNav role="child" />
    </div>
  );
};
