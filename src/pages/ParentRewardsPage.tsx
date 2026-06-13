import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Header,
  BottomNav,
  Card,
  Button,
  Modal,
  Badge,
} from '../components';
import { useStore } from '../store';
import { Gift, Plus, Edit2, Trash2, Star } from 'lucide-react';
import type { Reward } from '../types';
import { clsx } from 'clsx';

export const ParentRewardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, rewards, addReward, updateReward, deleteReward } =
    useStore();

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '🎁',
    starCost: 10,
  });

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const activeRewards = rewards.filter((r) => r.isActive);

  const openAddModal = () => {
    setEditingReward(null);
    setFormData({
      name: '',
      description: '',
      image: '🎁',
      starCost: 10,
    });
    setShowRewardModal(true);
  };

  const openEditModal = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description,
      image: reward.image,
      starCost: reward.starCost,
    });
    setShowRewardModal(true);
  };

  const handleSave = () => {
    if (!currentUser) return;

    if (editingReward) {
      updateReward(editingReward.id, formData);
    } else {
      addReward({
        ...formData,
        isActive: true,
        createdBy: currentUser.id,
      });
    }

    setShowRewardModal(false);
    setEditingReward(null);
  };

  const handleDelete = (rewardId: string) => {
    if (confirm('确定要删除这个奖励吗？')) {
      deleteReward(rewardId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="奖励管理" user={currentUser} showStars />

      <div className="container mx-auto px-4 py-6">
        <Button onClick={openAddModal} className="w-full mb-6" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          添加新奖励
        </Button>

        <div className="grid grid-cols-2 gap-4">
          {activeRewards.length === 0 ? (
            <Card className="col-span-2 text-center py-12">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                暂无奖励
              </h3>
              <p className="text-gray-600">点击上方按钮添加第一个奖励</p>
            </Card>
          ) : (
            activeRewards.map((reward) => (
              <Card key={reward.id} className="relative overflow-hidden">
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => openEditModal(reward)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(reward.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                <div className="text-5xl mb-3 text-center">
                  {reward.image}
                </div>

                <div className="text-center">
                  <h3 className="font-bold text-gray-800 mb-1">{reward.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {reward.description}
                  </p>

                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 text-gold-500 fill-current" />
                    <span className="text-xl font-bold text-gold-600">
                      {reward.starCost}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        title={editingReward ? '编辑奖励' : '添加奖励'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              奖励名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input"
              placeholder="例如：多玩30分钟游戏"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              选择图标
            </label>
            <div className="grid grid-cols-8 gap-2">
              {['🎁', '🎮', '📖', '🍦', '🎬', '🍕', '🎢', '🧸', '⚽', '🎨', '🎵', '✈️', '🏊', '🚴', '🎯', '🎲'].map(
                (emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setFormData({ ...formData, image: emoji })}
                    className={clsx(
                      'text-2xl p-2 rounded-lg transition-all',
                      formData.image === emoji
                        ? 'bg-primary-100 border-2 border-primary-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    )}
                  >
                    {emoji}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              奖励描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input min-h-[80px] resize-none"
              placeholder="描述这个奖励的具体内容..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              所需星星: {formData.starCost}
            </label>
            <input
              type="range"
              min="1"
              max="200"
              value={formData.starCost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  starCost: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowRewardModal(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button onClick={handleSave} className="flex-1">
              保存
            </Button>
          </div>
        </div>
      </Modal>

      <BottomNav role="parent" />
    </div>
  );
};
