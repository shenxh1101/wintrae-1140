import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, BottomNav, Card, Modal, Button, Badge } from '../components';
import { useStore } from '../store';
import type { Reward } from '../types';
import { Gift, Clock, CheckCircle2, XCircle, AlertCircle, History } from 'lucide-react';
import { clsx } from 'clsx';

export const ChildShopPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    rewards,
    addRedemption,
    deductStars,
    getLatestRedemptionsForReward,
    getAllRedemptionHistory,
  } = useStore();

  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const activeRewards = rewards.filter((r) => r.isActive);
  const allRedemptions = getAllRedemptionHistory(currentUser.id);
  const pendingCount = allRedemptions.filter(r => r.status === 'pending').length;

  const getRewardStatus = (rewardId: string) => {
    return getLatestRedemptionsForReward(currentUser.id, rewardId);
  };

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
    }, 2000);
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;

    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" size="sm" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            待审批
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="success" size="sm" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            已通过
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="danger" size="sm" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            已拒绝
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="奖励商店" user={currentUser} showStars />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-6 h-6 text-primary-500" />
              <h2 className="text-xl font-bold text-gray-800">奖励商店</h2>
            </div>
            <p className="text-sm text-gray-600">
              用你努力的星星换取喜欢的奖励吧！
            </p>
          </div>

          <button
            onClick={() => navigate('/child/redemptions')}
            className="relative flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <History className="w-4 h-4" />
            兑换记录
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {activeRewards.map((reward) => {
            const status = getRewardStatus(reward.id);
            const canAfford = currentUserStars >= reward.starCost;
            const isPending = status?.status === 'pending';
            const isRejected = status?.status === 'rejected';

            return (
              <Card key={reward.id} className="relative overflow-hidden">
                {status && (
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(status.status)}
                  </div>
                )}

                <div className="text-5xl mb-3 text-center pt-4">{reward.image}</div>

                <div className="text-center">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{reward.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{reward.description}</p>

                  <div className="flex items-center justify-center gap-1 mb-3">
                    <span className="text-gold-500">⭐</span>
                    <span className="text-2xl font-bold text-gold-600">
                      {reward.starCost}
                    </span>
                  </div>

                  {isPending ? (
                    <div className="text-sm text-secondary-600 font-semibold py-2">
                      等待爸爸妈妈审批中...
                    </div>
                  ) : isRejected ? (
                    <Button
                      onClick={() => handleRedeem(reward)}
                      className="w-full"
                      size="sm"
                      icon={<AlertCircle className="w-4 h-4" />}
                    >
                      重新兑换
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className="w-full"
                      size="sm"
                      icon={canAfford ? <Gift className="w-4 h-4" /> : undefined}
                    >
                      {canAfford ? '立即兑换' : '星星不足'}
                    </Button>
                  )}

                  {!canAfford && !isPending && (
                    <p className="text-xs text-gray-500 mt-2">
                      还差 {reward.starCost - currentUserStars} 颗星星
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
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
            兑换申请已提交！
          </h3>
          <p className="text-gray-600">
            等待爸爸妈妈审批~
          </p>
          <div className="mt-6 flex justify-center">
            <Clock className="w-16 h-16 text-secondary-500" />
          </div>
        </div>
      </Modal>

      <BottomNav role="child" />
    </div>
  );
};
