import React, { useMemo, useState } from 'react';
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
  LayoutGrid,
  Filter,
  ChevronDown,
} from 'lucide-react';
import type { CheckIn, Redemption } from '../types';
import { clsx } from 'clsx';

type ViewMode = 'kanban' | 'list';
type FilterType = 'all' | 'checkin' | 'redemption';
type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

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
  } = useStore();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterChild, setFilterChild] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const pendingCheckIns = checkIns.filter((c) => c.status === 'pending');
  const pendingRedemptions = redemptions.filter((r) => r.status === 'pending');
  const pendingCount = pendingCheckIns.length + pendingRedemptions.length;

  const getRewardById = (rewardId: string) => {
    return rewards.find((r) => r.id === rewardId);
  };

  const getUserById = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  const getUserStars = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.stars ?? 0;
  };

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

  const children = users.filter(u => u.role === 'child');

  const allApprovals = useMemo(() => {
    let items: (CheckIn | Redemption)[] = [];

    if (filterType === 'all' || filterType === 'checkin') {
      items = [...items, ...checkIns];
    }

    if (filterType === 'all' || filterType === 'redemption') {
      items = [...items, ...redemptions];
    }

    if (filterChild !== 'all') {
      items = items.filter(item => item.userId === filterChild);
    }

    if (filterStatus !== 'all') {
      items = items.filter(item => item.status === filterStatus);
    }

    return items.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [checkIns, redemptions, filterType, filterStatus, filterChild]);

  const pendingApprovals = allApprovals.filter(a => a.status === 'pending');
  const approvedApprovals = allApprovals.filter(a => a.status === 'approved');
  const rejectedApprovals = allApprovals.filter(a => a.status === 'rejected');

  const getItemType = (item: CheckIn | Redemption): 'checkin' | 'redemption' => {
    return 'taskId' in item ? 'checkin' : 'redemption';
  };

  const renderApprovalCard = (item: CheckIn | Redemption) => {
    const user = getUserById(item.userId);
    const currentStars = getUserStars(item.userId);
    const itemType = getItemType(item);

    if (itemType === 'checkin') {
      const checkInItem = item as CheckIn;
      const task = useStore.getState().tasks.find((t) => t.id === checkInItem.taskId);

      return (
        <Card key={item.id} className="mb-3">
          <div className="flex items-start gap-3 mb-3">
            {user && <Avatar emoji={user.avatar} size="md" />}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-800">{user?.name}</span>
                <Badge variant="primary" size="sm">
                  {task?.icon} {task?.name}
                </Badge>
                <Badge variant={
                  item.status === 'approved' ? 'success' :
                  item.status === 'rejected' ? 'danger' : 'secondary'
                } size="sm">
                  {item.status === 'approved' ? '已通过' :
                   item.status === 'rejected' ? '已退回' : '待审批'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {checkInItem.content || '无文字描述'}
              </p>
              {checkInItem.photo && (
                <img
                  src={checkInItem.photo}
                  alt="打卡照片"
                  className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 mb-2"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <Badge variant="gold" size="sm">
                  <Star className="w-3 h-3 mr-1" />
                  +{checkInItem.starsEarned}
                </Badge>
              </div>
            </div>
          </div>

          {item.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleRejectCheckIn(checkInItem)}
                variant="ghost"
                className="flex-1"
                icon={<XCircle className="w-4 h-4" />}
              >
                退回
              </Button>
              <Button
                onClick={() => handleApproveCheckIn(checkInItem)}
                className="flex-1"
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                通过
              </Button>
            </div>
          )}
        </Card>
      );
    } else {
      const redemptionItem = item as Redemption;
      const reward = getRewardById(redemptionItem.rewardId);

      return (
        <Card key={item.id} className="mb-3">
          <div className="flex items-start gap-3 mb-3">
            {user && <Avatar emoji={user.avatar} size="md" />}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-800">{user?.name}</span>
                <Badge variant="gold" size="sm">⭐ {currentStars}</Badge>
                <Badge variant={
                  item.status === 'approved' ? 'success' :
                  item.status === 'rejected' ? 'danger' : 'secondary'
                } size="sm">
                  {item.status === 'approved' ? '已通过' :
                   item.status === 'rejected' ? '已退回' : '待审批'}
                </Badge>
              </div>
              {reward && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">{reward.image}</span>
                    <div>
                      <div className="font-bold text-gray-800">{reward.name}</div>
                      <div className="text-sm text-gold-600">
                        <Star className="w-3 h-3 inline mr-1" />
                        -{redemptionItem.starsSpent}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                </>
              )}
              <div className="text-sm text-gray-500 mt-2">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {item.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleRejectRedemption(redemptionItem)}
                variant="ghost"
                className="flex-1"
                icon={<XCircle className="w-4 h-4" />}
              >
                拒绝（星星返还）
              </Button>
              <Button
                onClick={() => handleApproveRedemption(redemptionItem)}
                className="flex-1"
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                同意
              </Button>
            </div>
          )}
        </Card>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="审批中心" user={currentUser} showStars />

      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={clsx(
                'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2',
                viewMode === 'kanban'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              看板
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2',
                viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              <FileText className="w-4 h-4" />
              列表
            </button>
          </div>

          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'primary' : 'ghost'}
            icon={<Filter className="w-4 h-4" />}
            className="px-3"
          >
            筛选
            {showFilters && <ChevronDown className="w-4 h-4 ml-1 rotate-180" />}
            {!showFilters && <ChevronDown className="w-4 h-4 ml-1" />}
          </Button>
        </div>

        {showFilters && (
          <Card className="bg-gray-50">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">类型筛选</label>
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: '全部' },
                    { id: 'checkin', label: '打卡' },
                    { id: 'redemption', label: '兑换' },
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setFilterType(option.id as FilterType)}
                      className={clsx(
                        'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all',
                        filterType === option.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">状态筛选</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: 'all', label: '全部' },
                    { id: 'pending', label: '待处理' },
                    { id: 'approved', label: '已通过' },
                    { id: 'rejected', label: '已退回' },
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setFilterStatus(option.id as FilterStatus)}
                      className={clsx(
                        'py-2 px-3 rounded-lg text-sm font-semibold transition-all',
                        filterStatus === option.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">按孩子筛选</label>
                <select
                  value={filterChild}
                  onChange={(e) => setFilterChild(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                >
                  <option value="all">全部孩子</option>
                  {children.map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        )}

        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Card className="bg-yellow-50 border-2 border-yellow-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-bold text-gray-800">待处理</h3>
                  <Badge variant="secondary" size="sm">{pendingApprovals.length}</Badge>
                </div>

                {pendingApprovals.length === 0 ? (
                  <p className="text-center text-gray-400 py-4 text-sm">暂无待处理项</p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {pendingApprovals.map(item => renderApprovalCard(item))}
                  </div>
                )}
              </Card>
            </div>

            <div>
              <Card className="bg-green-50 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-800">已通过</h3>
                  <Badge variant="success" size="sm">{approvedApprovals.length}</Badge>
                </div>

                {approvedApprovals.length === 0 ? (
                  <p className="text-center text-gray-400 py-4 text-sm">暂无记录</p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                     {approvedApprovals.slice(0, 10).map(item => renderApprovalCard(item))}
                   </div>
                )}
              </Card>
            </div>

            <div>
              <Card className="bg-red-50 border-2 border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-gray-800">已退回</h3>
                  <Badge variant="danger" size="sm">{rejectedApprovals.length}</Badge>
                </div>

                {rejectedApprovals.length === 0 ? (
                  <p className="text-center text-gray-400 py-4 text-sm">暂无记录</p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                     {rejectedApprovals.slice(0, 10).map(item => renderApprovalCard(item))}
                   </div>
                )}
              </Card>
            </div>
          </div>
        ) : (
          <div>
            <Card className="mb-4 bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-200">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary-600" />
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    待审批 ({pendingApprovals.length})
                  </h3>
                  <p className="text-sm text-gray-600">
                    {pendingApprovals.filter(a => getItemType(a) === 'checkin').length} 个打卡 · {pendingApprovals.filter(a => getItemType(a) === 'redemption').length} 个兑换
                  </p>
                </div>
              </div>
            </Card>

            {allApprovals.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  太棒了！没有符合条件的记录
                </h3>
                <p className="text-gray-600">试试调整筛选条件~</p>
              </Card>
            ) : (
                <div className="space-y-3">
                  {allApprovals.map(item => renderApprovalCard(item))}
                </div>
              )}
          </div>
        )}
      </div>

      <BottomNav role="parent" />
    </div>
  );
};
