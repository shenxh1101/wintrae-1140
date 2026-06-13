import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Header,
  BottomNav,
  Card,
  Button,
  Modal,
  Avatar,
  Badge,
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
  Plus,
  Edit2,
  UserPlus,
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
    addChild,
    updateUser,
    setCurrentUser,
    setCurrentRole,
    addTemporaryChallenge,
  } = useStore();

  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState<typeof users[0] | null>(null);
  const [childForm, setChildForm] = useState({
    name: '',
    avatar: '🧒',
  });
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

  const handleAddChild = () => {
    if (!childForm.name.trim()) return;
    
    if (editingChild) {
      updateUser(editingChild.id, {
        name: childForm.name,
        avatar: childForm.avatar,
      });
    } else {
      addChild(childForm.name, childForm.avatar);
    }
    
    setShowChildModal(false);
    setEditingChild(null);
    setChildForm({ name: '', avatar: '🧒' });
  };

  const handleEditChild = (child: typeof users[0]) => {
    setEditingChild(child);
    setChildForm({ name: child.name, avatar: child.avatar });
    setShowChildModal(true);
  };

  const avatarOptions = ['🧒', '👦', '👧', '🧒🏻', '🧒🏼', '🧒🏽', '🧒🏾', '🧒🏿', '👶', '🦸', '🦸‍♀️', '🦸‍♂️'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="系统设置" user={currentUser} />

      <div className="container mx-auto px-4 py-6 space-y-4">
        <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{family.avatar}</div>
            <div>
              <h2 className="text-xl font-bold mb-1">{family.name}</h2>
              <p className="text-white/80 text-sm">家庭邀请码: {family.inviteCode}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-800">家庭成员管理</h3>
            </div>
            <Button
              onClick={() => {
                setEditingChild(null);
                setChildForm({ name: '', avatar: '🧒' });
                setShowChildModal(true);
              }}
              size="sm"
              icon={<UserPlus className="w-4 h-4" />}
            >
              添加孩子
            </Button>
          </div>

          <div className="space-y-3">
            {children.map((child) => (
              <div
                key={child.id}
                className="p-3 bg-gray-50 rounded-xl flex items-center gap-3"
              >
                <Avatar emoji={child.avatar} size="md" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{child.name}</div>
                  <div className="text-sm text-gold-600">⭐ {child.stars} 颗星星</div>
                </div>
                <button
                  onClick={() => handleEditChild(child)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ))}

            {children.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                暂无孩子，点击上方按钮添加
              </p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-800">临时挑战</h3>
            </div>
            <Badge variant="secondary">{challenges.filter(c => c.isActive).length} 个进行中</Badge>
          </div>

          <Button
            onClick={() => setShowChallengeModal(true)}
            variant="secondary"
            className="w-full mb-4"
            icon={<Plus className="w-4 h-4" />}
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
          <Card className="cursor-pointer hover:shadow-card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">提醒设置</h3>
                <p className="text-sm text-gray-600">设置任务提醒时间</p>
              </div>
            </div>
          </Card>

          <Card className="cursor-pointer hover:shadow-card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-secondary-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">规则锁定</h3>
                <p className="text-sm text-gray-600">限制孩子修改关键规则</p>
              </div>
            </div>
          </Card>

          <Card className="cursor-pointer hover:shadow-card-hover">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center">
                <Star className="w-6 h-6 text-gold-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">鼓励语设置</h3>
                <p className="text-sm text-gray-600">自定义鼓励语模板</p>
              </div>
            </div>
          </Card>
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

      <Modal
        isOpen={showChildModal}
        onClose={() => {
          setShowChildModal(false);
          setEditingChild(null);
          setChildForm({ name: '', avatar: '🧒' });
        }}
        title={editingChild ? '编辑孩子信息' : '添加孩子'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              昵称
            </label>
            <input
              type="text"
              value={childForm.name}
              onChange={(e) =>
                setChildForm({ ...childForm, name: e.target.value })
              }
              className="input"
              placeholder="输入孩子昵称"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              选择头像
            </label>
            <div className="grid grid-cols-6 gap-2">
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setChildForm({ ...childForm, avatar: emoji })}
                  className={clsx(
                    'text-3xl p-3 rounded-xl transition-all',
                    childForm.avatar === emoji
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowChildModal(false);
                setEditingChild(null);
                setChildForm({ name: '', avatar: '🧒' });
              }}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleAddChild}
              disabled={!childForm.name.trim()}
              className="flex-1"
            >
              {editingChild ? '保存' : '添加'}
            </Button>
          </div>
        </div>
      </Modal>

      <BottomNav role="parent" />
    </div>
  );
};
