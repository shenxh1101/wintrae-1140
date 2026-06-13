import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Header,
  BottomNav,
  Card,
  Button,
  Badge,
  Avatar,
} from '../components';
import { useStore } from '../store';
import {
  CheckCircle2,
  XCircle,
  Star,
  Clock,
  Gift,
  FileText,
  Camera,
} from 'lucide-react';
import type { CheckIn, Redemption } from '../types';
import { clsx } from 'clsx';

export const ParentApprovePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    checkIns,
    redemptions,
    rewards,
    users,
    approveCheckIn,
    rejectCheckIn,
    approveRedemption,
    rejectRedemption,
    getPendingApprovals,
  } = useStore();

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const pendingCheckIns = checkIns.filter((c) => c.status === 'pending');
  const pendingRedemptions = redemptions.filter((r) => r.status === 'pending');
  const pendingCount = pendingCheckIns.length + pendingRedemptions.length;

  const handleApproveCheckIn = (checkIn: CheckIn) => {
    approveCheckIn(checkIn.id, currentUser.id);
  };

  const handleRejectCheckIn = (checkIn: CheckIn) => {
    rejectCheckIn(checkIn.id);
  };

  const handleApproveRedemption = (redemption: Redemption) => {
    approveRedemption(redemption.id, currentUser.id);
  };

  const handleRejectRedemption = (redemption: Redemption) => {
    rejectRedemption(redemption.id);
  };

  const getRewardById = (rewardId: string) => {
    return rewards.find((r) => r.id === rewardId);
  };

  const getUserById = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="审批中心"
        user={currentUser}
        showStars
      />

      <div className="container mx-auto px-4 py-6">
        {pendingCount === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              太棒了！没有待审批项
            </h3>
            <p className="text-gray-600">所有申请都已处理完毕~</p>
          </Card>
        ) : (
          <>
            <Card className="mb-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-200">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary-600" />
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    待审批 ({pendingCount})
                  </h3>
                  <p className="text-sm text-gray-600">
                    {pendingCheckIns.length} 个打卡 · {pendingRedemptions.length} 个兑换
                  </p>
                </div>
              </div>
            </Card>

            {pendingCheckIns.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary-500" />
                  <h3 className="font-bold text-lg text-gray-800">打卡申请</h3>
                </div>

                <div className="space-y-3">
                  {pendingCheckIns.map((checkIn) => {
                    const user = getUserById(checkIn.userId);
                    const task = useStore
                      .getState()
                      .tasks.find((t) => t.id === checkIn.taskId);

                    return (
                      <Card key={checkIn.id}>
                        <div className="flex items-start gap-3 mb-3">
                          {user && <Avatar emoji={user.avatar} size="md" />}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-800">
                                {user?.name}
                              </span>
                              <Badge variant="primary" size="sm">
                                {task?.icon} {task?.name}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {checkIn.content}
                            </p>
                            {checkIn.photo && (
                              <img
                                src={checkIn.photo}
                                alt="打卡照片"
                                className="w-full h-40 object-cover rounded-xl border-2 border-gray-200 mb-2"
                              />
                            )}
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-500">
                                {new Date(
                                  checkIn.createdAt
                                ).toLocaleDateString()}
                              </span>
                              <Badge variant="gold" size="sm">
                                <Star className="w-3 h-3 mr-1" />
                                +{checkIn.starsEarned}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRejectCheckIn(checkIn)}
                            variant="ghost"
                            className="flex-1"
                            icon={<XCircle className="w-4 h-4" />}
                          >
                            退回
                          </Button>
                          <Button
                            onClick={() => handleApproveCheckIn(checkIn)}
                            className="flex-1"
                            icon={<CheckCircle2 className="w-4 h-4" />}
                          >
                            通过
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {pendingRedemptions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-gold-500" />
                  <h3 className="font-bold text-lg text-gray-800">兑换申请</h3>
                </div>

                <div className="space-y-3">
                  {pendingRedemptions.map((redemption) => {
                    const user = getUserById(redemption.userId);
                    const reward = getRewardById(redemption.rewardId);

                    return (
                      <Card key={redemption.id}>
                        <div className="flex items-start gap-3 mb-3">
                          {user && <Avatar emoji={user.avatar} size="md" />}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-800">
                                {user?.name}
                              </span>
                              <Badge variant="gold" size="sm">
                                ⭐ {user?.stars}
                              </Badge>
                            </div>
                            {reward && (
                              <>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-3xl">
                                    {reward.image}
                                  </span>
                                  <div>
                                    <div className="font-bold text-gray-800">
                                      {reward.name}
                                    </div>
                                    <div className="text-sm text-gold-600">
                                      <Star className="w-3 h-3 inline mr-1" />
                                      -{redemption.starsSpent}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {reward.description}
                                </p>
                              </>
                            )}
                            <div className="text-sm text-gray-500 mt-2">
                              {new Date(
                                redemption.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRejectRedemption(redemption)}
                            variant="ghost"
                            className="flex-1"
                            icon={<XCircle className="w-4 h-4" />}
                          >
                            拒绝
                          </Button>
                          <Button
                            onClick={() => handleApproveRedemption(redemption)}
                            className="flex-1"
                            icon={<CheckCircle2 className="w-4 h-4" />}
                          >
                            同意
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav role="parent" />
    </div>
  );
};
