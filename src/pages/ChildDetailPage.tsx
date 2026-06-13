import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Header,
  BottomNav,
  Card,
  Badge,
  Avatar,
} from '../components';
import { useStore } from '../store';
import {
  Star,
  Calendar,
  Gift,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

export const ChildDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { getChildDetail, rewards } = useStore();

  const childDetail = useMemo(() => {
    if (!userId) return null;
    return getChildDetail(userId);
  }, [userId, useStore.getState().users, useStore.getState().tasks, useStore.getState().checkIns, useStore.getState().redemptions]);

  if (!childDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="孩子详情" showBack />
        <div className="container mx-auto px-4 py-6">
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">未找到该成员</h3>
            <p className="text-gray-600">可能已被删除</p>
          </Card>
        </div>
      </div>
    );
  }

  const { user, assignedTasks, totalStars, lastCheckIn, recentCheckIns, recentRedemptions } = childDetail;

  const getTaskById = (taskId: string) => {
    return assignedTasks.find(t => t.id === taskId);
  };

  const getRewardById = (rewardId: string) => {
    return rewards.find(r => r.id === rewardId);
  };

  const repeatTypeLabels: Record<string, string> = {
    daily: '每天',
    weekdays: '工作日',
    weekends: '周末',
    custom: '自定义',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title={`${user.name}的详情`} showBack />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="bg-gradient-to-r from-secondary-500 to-primary-500 text-white">
          <div className="flex items-center gap-4 mb-4">
            <Avatar emoji={user.avatar} size="xl" />
            <div>
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <p className="text-white/80 text-sm">小朋友</p>
            </div>
            <div className="ml-auto text-right">
              <div className="flex items-center gap-1 text-2xl font-bold">
                <span>⭐</span>
                <span>{totalStars}</span>
              </div>
              <p className="text-white/80 text-xs">当前星星</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary-500" />
            <h3 className="font-bold text-gray-800">当前习惯</h3>
            <Badge variant="primary" size="sm">{assignedTasks.length}个</Badge>
          </div>

          {assignedTasks.length === 0 ? (
            <p className="text-center text-gray-500 py-4">暂无分配的习惯</p>
          ) : (
            <div className="space-y-3">
              {assignedTasks.map(task => (
                <div key={task.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{task.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{task.name}</div>
                      <div className="text-sm text-gray-600">{task.description}</div>
                    </div>
                    <Badge variant="secondary" size="sm">
                      {repeatTypeLabels[task.repeatType]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{task.reminderTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gold-500" />
                      <span>+{task.starReward}</span>
                    </div>
                    {task.requireApproval && (
                      <Badge variant="danger" size="sm">需审核</Badge>
                    )}
                    {task.requirePhoto && (
                      <Badge variant="secondary" size="sm">需拍照</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-success-500" />
            <h3 className="font-bold text-gray-800">最近打卡记录</h3>
          </div>

          {recentCheckIns.length === 0 ? (
            <p className="text-center text-gray-500 py-4">暂无打卡记录</p>
          ) : (
            <div className="space-y-3">
              {recentCheckIns.map((checkIn) => {
                const task = getTaskById(checkIn.taskId);
                return (
                  <div key={checkIn.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white">
                        {checkIn.status === 'approved' ? (
                          <CheckCircle2 className="w-5 h-5 text-success-500" />
                        ) : checkIn.status === 'rejected' ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{task?.icon}</span>
                          <span className="font-semibold text-gray-800">{task?.name}</span>
                          <Badge
                            variant={checkIn.status === 'approved' ? 'success' : checkIn.status === 'rejected' ? 'danger' : 'secondary'}
                            size="sm"
                          >
                            {checkIn.status === 'approved' ? '已通过' : checkIn.status === 'rejected' ? '已退回' : '待审核'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {checkIn.content || '无描述'}
                        </p>
                        {checkIn.photo && (
                          <img
                            src={checkIn.photo}
                            alt="打卡照片"
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{new Date(checkIn.checkInDate).toLocaleDateString()}</span>
                          {checkIn.status === 'approved' && (
                            <span className="text-gold-600">+{checkIn.starsEarned}⭐</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-gold-500" />
            <h3 className="font-bold text-gray-800">兑换记录</h3>
          </div>

          {recentRedemptions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">暂无兑换记录</p>
          ) : (
            <div className="space-y-3">
              {recentRedemptions.map((redemption) => {
                const reward = getRewardById(redemption.rewardId);
                return (
                  <div key={redemption.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white">
                        {redemption.status === 'approved' ? (
                          <CheckCircle2 className="w-5 h-5 text-success-500" />
                        ) : redemption.status === 'rejected' ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{reward?.image}</span>
                          <div>
                            <div className="font-semibold text-gray-800">{reward?.name}</div>
                            <div className="text-sm text-gold-600">-{redemption.starsSpent}⭐</div>
                          </div>
                          <Badge
                            variant={redemption.status === 'approved' ? 'success' : redemption.status === 'rejected' ? 'danger' : 'secondary'}
                            size="sm"
                            className="ml-auto"
                          >
                            {redemption.status === 'approved' ? '已通过' : redemption.status === 'rejected' ? '已拒绝' : '待审核'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(redemption.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <BottomNav role="parent" />
    </div>
  );
};
