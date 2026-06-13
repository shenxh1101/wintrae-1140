import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Header,
  BottomNav,
  Card,
  Button,
  Modal,
} from '../components';
import { useStore } from '../store';
import {
  Settings,
  Bell,
  Shield,
  Users,
  Clock,
  Star,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';

export const ParentSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    family,
    users,
    settings,
    challenges,
    addTemporaryChallenge,
    setCurrentUser,
    setCurrentRole,
  } = useStore();

  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    starReward: 10,
  });

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const children = users.filter((u) => u.role === 'child');

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    navigate('/');
  };

  const handleAddChallenge = () => {
    if (!currentUser) return;

    addTemporaryChallenge({
      name: challengeForm.name,
      description: challengeForm.description,
      startDate: challengeForm.startDate,
      endDate: challengeForm.endDate,
      starReward: challengeForm.starReward,
      isActive: true,
      createdBy: currentUser.id,
    });

    setShowChallengeModal(false);
    setChallengeForm({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      starReward: 10,
    });
  };

  const settingItems = [
    {
      icon: Bell,
      label: '提醒设置',
      description: '设置任务提醒时间',
      color: 'text-primary-500 bg-primary-50',
    },
    {
      icon: Shield,
      label: '规则锁定',
      description: '限制孩子修改关键规则',
      color: 'text-secondary-500 bg-secondary-50',
    },
    {
      icon: Users,
      label: '成员管理',
      description: '添加或移除家庭成员',
      color: 'text-success-500 bg-success-50',
    },
    {
      icon: Star,
      label: '鼓励语设置',
      description: '自定义鼓励语模板',
      color: 'text-gold-500 bg-gold-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="系统设置" user={currentUser} />

      <div className="container mx-auto px-4 py-6 space-y-4">
        <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{family.avatar}</div>
            <div>
              <h2 className="text-xl font-bold mb-1">{family.name}</h2>
              <p className="text-white/80 text-sm">家庭邀请码: {family.inviteCode}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary-500" />
            <h3 className="font-bold text-gray-800">临时挑战</h3>
          </div>

          <Button
            onClick={() => setShowChallengeModal(true)}
            variant="secondary"
            className="w-full mb-4"
          >
            创建新挑战
          </Button>

          <div className="space-y-2">
            {challenges
              .filter((c) => c.isActive)
              .map((challenge) => (
                <div
                  key={challenge.id}
                  className="p-3 bg-gray-50 rounded-xl flex items-center gap-3"
                >
                  <div className="text-2xl">🏆</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {challenge.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {challenge.description}
                    </div>
                  </div>
                  <div className="text-sm text-gold-600 font-bold">
                    +{challenge.starReward}⭐
                  </div>
                </div>
              ))}

            {challenges.filter((c) => c.isActive).length === 0 && (
              <p className="text-center text-gray-500 py-4">
                暂无进行中的挑战
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-3">
          {settingItems.map((item, idx) => (
            <Card key={idx} className="cursor-pointer hover:shadow-card-hover">
              <div className="flex items-center gap-4">
                <div
                  className={clsx(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    item.color
                  )}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{item.label}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">系统版本</h3>
                <p className="text-sm text-gray-600">v1.0.0</p>
              </div>
            </div>
          </div>
        </Card>

        <Button
          onClick={handleLogout}
          variant="danger"
          className="w-full"
          icon={<LogOut className="w-5 h-5" />}
        >
          退出登录
        </Button>
      </div>

      <Modal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        title="创建临时挑战"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              挑战名称
            </label>
            <input
              type="text"
              value={challengeForm.name}
              onChange={(e) =>
                setChallengeForm({ ...challengeForm, name: e.target.value })
              }
              className="input"
              placeholder="例如：周末早起挑战"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              挑战描述
            </label>
            <textarea
              value={challengeForm.description}
              onChange={(e) =>
                setChallengeForm({
                  ...challengeForm,
                  description: e.target.value,
                })
              }
              className="input min-h-[80px] resize-none"
              placeholder="描述挑战的具体要求..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                开始日期
              </label>
              <input
                type="date"
                value={challengeForm.startDate}
                onChange={(e) =>
                  setChallengeForm({ ...challengeForm, startDate: e.target.value })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                结束日期
              </label>
              <input
                type="date"
                value={challengeForm.endDate}
                onChange={(e) =>
                  setChallengeForm({ ...challengeForm, endDate: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              星星奖励: {challengeForm.starReward}
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={challengeForm.starReward}
              onChange={(e) =>
                setChallengeForm({
                  ...challengeForm,
                  starReward: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowChallengeModal(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button onClick={handleAddChallenge} className="flex-1">
              创建挑战
            </Button>
          </div>
        </div>
      </Modal>

      <BottomNav role="parent" />
    </div>
  );
};
