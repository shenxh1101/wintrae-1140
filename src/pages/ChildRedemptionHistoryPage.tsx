import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Header,
  BottomNav,
  Card,
  Badge,
  Button,
} from '../components';
import { useStore } from '../store';
import {
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  History,
} from 'lucide-react';
import { clsx } from 'clsx';

type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

export const ChildRedemptionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, rewards, getAllRedemptionHistory } = useStore();
  const [filter, setFilter] = useState<FilterType>('all');

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const allRedemptions = useMemo(
    () => getAllRedemptionHistory(currentUser.id),
    [currentUser.id, useStore.getState().redemptions]
  );

  const filteredRedemptions = useMemo(() => {
    if (filter === 'all') return allRedemptions;
    return allRedemptions.filter(r => r.status === filter);
  }, [allRedemptions, filter]);

  const getRewardById = (rewardId: string) => {
    return rewards.find(r => r.id === rewardId);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: '待审批',
          badgeVariant: 'secondary' as const,
        };
      case 'approved':
        return {
          icon: CheckCircle2,
          color: 'text-success-500',
          bgColor: 'bg-success-50',
          borderColor: 'border-success-200',
          label: '已通过',
          badgeVariant: 'success' as const,
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: '已拒绝',
          badgeVariant: 'danger' as const,
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: '未知',
          badgeVariant: 'secondary' as const,
        };
    }
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'pending', label: '待处理' },
    { id: 'approved', label: '已通过' },
    { id: 'rejected', label: '已退回' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="兑换记录" user={currentUser} showBack showStars />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all',
                  filter === f.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {f.label}
                {f.id === 'pending' && allRedemptions.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {allRedemptions.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {filteredRedemptions.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {filter === 'all' ? '暂无兑换记录' : `暂无${filters.find(f => f.id === filter)?.label}的记录`}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' ? '去商店兑换喜欢的奖励吧！' : '尝试切换其他筛选条件'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRedemptions.map((redemption) => {
              const reward = getRewardById(redemption.rewardId);
              const config = getStatusConfig(redemption.status);
              const StatusIcon = config.icon;

              return (
                <Card key={redemption.id} className={clsx('border-2', config.borderColor)}>
                  <div className="flex items-start gap-4">
                    <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center', config.bgColor)}>
                      <StatusIcon className={clsx('w-6 h-6', config.color)} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">{reward?.image}</span>
                        <div>
                          <h3 className="font-bold text-gray-800">{reward?.name}</h3>
                          <p className="text-sm text-gray-600">{reward?.description}</p>
                        </div>
                        <Badge variant={config.badgeVariant} size="sm" className="ml-auto">
                          {config.label}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className={clsx('font-bold', redemption.status === 'approved' ? 'text-success-600' : redemption.status === 'rejected' ? 'text-red-600' : 'text-gold-600')}>
                            {redemption.status === 'rejected' ? '返还' : redemption.status === 'approved' ? '已扣' : '消耗'} {redemption.starsSpent}⭐
                          </span>
                          <span className="text-gray-500">
                            {new Date(redemption.createdAt).toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {redemption.processedAt && (
                        <div className="mt-2 text-xs text-gray-400">
                          处理时间: {new Date(redemption.processedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav role="child" />
    </div>
  );
};
