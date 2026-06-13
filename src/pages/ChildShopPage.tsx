import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, BottomNav, RewardCard, Modal, Button, Card } from '../components';
import { useStore } from '../store';
import type { Reward } from '../types';
import { Gift, Clock, CheckCircle2 } from 'lucide-react';
import { encouragementMessages } from '../data/mockData';
import { EncouragementBubble } from '../components/EncouragementBubble';

export const ChildShopPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    rewards,
    redemptions,
    addRedemption,
    deductStars,
  } = useStore();

  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const activeRewards = rewards.filter((r) => r.isActive);
  const userRedemptions = redemptions.filter(
    (r) => r.userId === currentUser.id
  );

  const pendingRedemptions = userRedemptions.filter(
    (r) => r.status === 'pending'
  );

  const currentUserStars = useMemo(() => {
    const user = useStore.getState().users.find(u => u.id === currentUser.id);
    return user?.stars ?? 0;
  }, [currentUser.id, useStore.getState().users]);

  const handleRedeem = (reward: Reward) => {
    setSelectedReward(reward);
    setShowConfirmModal(true);
  };

  const confirmRedeem = () => {
    if (!selectedReward || !currentUser) return;

    const success = deductStars(currentUser.id, selectedReward.starCost);
    if (!success) return;

    addRedemption({
      rewardId: selectedReward.id,
      userId: currentUser.id,
      status: 'pending',
      starsSpent: selectedReward.starCost,
    });

    setShowConfirmModal(false);
    setShowSuccessModal(true);
    setSelectedReward(null);

    setTimeout(() => {
      setShowSuccessModal(false);
      const messages = encouragementMessages.rewardRedeemed;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setEncouragementMessage(randomMessage);
      setShowEncouragement(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="奖励商店"
        user={currentUser}
        showStars
      />

      <div className="container mx-auto px-4 py-6">
        {pendingRedemptions.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-200">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-primary-600" />
              <h3 className="font-bold text-gray-800">
                待审批的兑换 ({pendingRedemptions.length})
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              你的兑换申请正在等待爸爸妈妈审批中...
            </p>
          </Card>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-bold text-gray-800">可用奖励</h2>
          </div>
          <p className="text-sm text-gray-600">
            用你努力的星星换取喜欢的奖励吧！
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {activeRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userStars={currentUserStars}
              onRedeem={() => handleRedeem(reward)}
            />
          ))}
        </div>

        {activeRewards.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              商店暂无可用奖励
            </h3>
            <p className="text-gray-600">让爸爸妈妈添加一些奖励吧！</p>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="确认兑换"
        size="sm"
      >
        {selectedReward && (
          <div className="text-center">
            <div className="text-6xl mb-4">{selectedReward.image}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {selectedReward.name}
            </h3>
            <p className="text-gray-600 mb-6">{selectedReward.description}</p>

            <div className="bg-gold-50 border-2 border-gold-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">将消耗</p>
              <p className="text-3xl font-bold text-gold-600">
                ⭐ {selectedReward.starCost}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                剩余: {currentUserStars - selectedReward.starCost} 颗星星
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button onClick={confirmRedeem} className="flex-1">
                确认兑换 🎁
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        size="sm"
        showClose={false}
      >
        <div className="text-center py-4">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            兑换成功！
          </h3>
          <p className="text-gray-600">
            你的兑换申请已提交，等待爸爸妈妈审批~
          </p>
          <div className="mt-6 flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-success-500" />
          </div>
        </div>
      </Modal>

      <EncouragementBubble
        message={encouragementMessages.rewardRedeemed[0]}
        isVisible={showEncouragement}
        onClose={() => setShowEncouragement(false)}
      />

      <BottomNav role="child" />
    </div>
  );
};
