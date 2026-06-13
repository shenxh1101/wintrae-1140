import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Header,
  BottomNav,
  Card,
  Badge,
  Avatar,
  Button,
  Modal,
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
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  History,
} from 'lucide-react';
import { clsx } from 'clsx';

type TabType = 'overview' | 'checkins' | 'redemptions' | 'tasks' | 'stars' | 'encouragement';

export const ChildDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const {
    getEnhancedChildDetail,
    rewards,
    assignTaskToChild,
    unassignTaskFromChild,
    adjustStars,
    setChildEncouragement,
  } = useStore();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showStarModal, setShowStarModal] = useState(false);
  const [starDelta, setStarDelta] = useState(0);
  const [starReason, setStarReason] = useState('');
  const [showEncouragementModal, setShowEncouragementModal] = useState(false);
  const [encouragementText, setEncouragementText] = useState('');

  const childDetail = useMemo(() => {
    if (!userId) return null;
    return getEnhancedChildDetail(userId);
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

  const {
    user,
    assignedTasks,
    totalStars,
    pendingApprovals,
    pendingCheckIns,
    pendingRedemptions,
    completedCheckIns,
    completedRedemptions,
    allTasks,
    starHistory,
    taskAssignmentHistory,
    encouragement,
  } = childDetail;

  const getTaskById = (taskId: string) => {
    return allTasks.find(t => t.id === taskId);
  };

  const getRewardById = (rewardId: string) => {
    return rewards.find(r => r.id === rewardId);
  };

  const handleToggleTask = (taskId: string) => {
    if (!userId) return;
    
    if (assignedTasks.some(t => t.id === taskId)) {
      unassignTaskFromChild(taskId, userId);
    } else {
      assignTaskToChild(taskId, userId);
    }
  };

  const handleAdjustStars = () => {
    if (!userId || starDelta === 0) return;
    adjustStars(userId, starDelta);
    setShowStarModal(false);
    setStarDelta(0);
    setStarReason('');
  };

  const handleSaveEncouragement = () => {
    if (!userId) return;
    setChildEncouragement(userId, encouragementText);
    setShowEncouragementModal(false);
  };

  const handleEditEncouragement = () => {
    setEncouragementText(encouragement || '');
    setShowEncouragementModal(true);
  };

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'overview', label: '概况' },
    { id: 'checkins', label: '打卡', count: pendingCheckIns.length },
    { id: 'redemptions', label: '兑换', count: pendingRedemptions.length },
    { id: 'tasks', label: '习惯' },
    { id: 'stars', label: '星星' },
  ];

  const repeatTypeLabels: Record<string, string> = {
    daily: '每天',
    weekdays: '工作日',
    weekends: '周末',
    custom: '自定义',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title={`${user.name}`} showBack />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="bg-gradient-to-r from-secondary-500 to-primary-500 text-white">
          <div className="flex items-center gap-4 mb-4">
            <Avatar emoji={user.avatar} size="xl" />
            <div>
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <p className="text-white/80 text-sm">小朋友</p>
            </div>
            <div className="ml-auto text-right">
              <button
                onClick={() => setShowStarModal(true)}
                className="flex items-center gap-1 text-2xl font-bold bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-colors"
              >
                <span>⭐</span>
                <span>{totalStars}</span>
              </button>
              <p className="text-white/80 text-xs mt-1">点击调整星星</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all',
                  activeTab === tab.id
                    ? 'bg-white text-primary-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {activeTab === 'overview' && (
          <>
            {encouragement && (
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">家长鼓励语</h3>
                      <button
                        onClick={handleEditEncouragement}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        编辑
                      </button>
                    </div>
                    <p className="text-gray-700">{encouragement}</p>
                  </div>
                </div>
              </Card>
            )}

            <Card
              className={clsx(
                'cursor-pointer transition-all',
                !encouragement && 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 hover:shadow-card-hover'
              )}
              onClick={handleEditEncouragement}
            >
              {!encouragement ? (
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">添加鼓励语</h3>
                    <p className="text-sm text-gray-600">给孩子留言鼓励他/她</p>
                  </div>
                </div>
              ) : null}
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-success-500" />
                <h3 className="font-bold text-gray-800">待审批</h3>
                <Badge variant="secondary">{pendingApprovals.length}</Badge>
              </div>

              {pendingApprovals.length === 0 ? (
                <p className="text-center text-gray-500 py-4">暂无待审批项</p>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.slice(0, 3).map((item) => {
                    const isCheckIn = 'taskId' in item;
                    const task = isCheckIn ? getTaskById(item.taskId) : null;
                    const reward = !isCheckIn ? getRewardById(item.rewardId) : null;

                    return (
                      <div key={item.id} className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="flex items-center gap-2">
                          {isCheckIn ? (
                            <>
                              <span className="text-xl">{task?.icon}</span>
                              <span className="font-semibold text-gray-800">{task?.name}</span>
                              <Badge variant="secondary" size="sm">打卡待审</Badge>
                            </>
                          ) : (
                            <>
                              <span className="text-xl">{reward?.image}</span>
                              <span className="font-semibold text-gray-800">{reward?.name}</span>
                              <Badge variant="gold" size="sm">兑换待审</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-800">当前习惯</h3>
                <Badge variant="primary" size="sm">{assignedTasks.length}个</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {assignedTasks.map((task) => (
                  <div key={task.id} className="px-3 py-2 bg-gray-50 rounded-lg flex items-center gap-2">
                    <span>{task.icon}</span>
                    <span className="text-sm font-semibold text-gray-700">{task.name}</span>
                  </div>
                ))}
                {assignedTasks.length === 0 && (
                  <p className="text-gray-500 text-sm">暂无分配的习惯</p>
                )}
              </div>
            </Card>
          </>
        )}

        {activeTab === 'checkins' && (
          <>
            {pendingCheckIns.length > 0 && (
              <Card>
                <h3 className="font-bold text-gray-800 mb-4">🕐 待审批</h3>
                <div className="space-y-3">
                  {pendingCheckIns.map((checkIn) => {
                    const task = getTaskById(checkIn.taskId);
                    return (
                      <div key={checkIn.id} className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-yellow-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{task?.icon}</span>
                              <span className="font-bold text-gray-800">{task?.name}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{checkIn.content || '无描述'}</p>
                            {checkIn.photo && (
                              <img src={checkIn.photo} alt="" className="w-20 h-20 object-cover rounded-lg" />
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(checkIn.checkInDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card>
              <h3 className="font-bold text-gray-800 mb-4">✅ 已完成</h3>
              {completedCheckIns.length === 0 ? (
                <p className="text-center text-gray-500 py-4">暂无记录</p>
              ) : (
                <div className="space-y-3">
                  {completedCheckIns.slice(0, 10).map((checkIn) => {
                    const task = getTaskById(checkIn.taskId);
                    return (
                      <div key={checkIn.id} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-success-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{task?.icon}</span>
                              <span className="font-semibold text-gray-800">{task?.name}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(checkIn.checkInDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-gold-600 font-bold">+{checkIn.starsEarned}⭐</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </>
        )}

        {activeTab === 'redemptions' && (
          <>
            {pendingRedemptions.length > 0 && (
              <Card>
                <h3 className="font-bold text-gray-800 mb-4">🕐 待审批</h3>
                <div className="space-y-3">
                  {pendingRedemptions.map((redemption) => {
                    const reward = getRewardById(redemption.rewardId);
                    return (
                      <div key={redemption.id} className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{reward?.image}</span>
                          <div className="flex-1">
                            <div className="font-bold text-gray-800">{reward?.name}</div>
                            <div className="text-sm text-gold-600">-{redemption.starsSpent}⭐</div>
                          </div>
                          <Badge variant="secondary">待审批</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card>
              <h3 className="font-bold text-gray-800 mb-4">✅ 已通过</h3>
              {completedRedemptions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">暂无记录</p>
              ) : (
                <div className="space-y-3">
                  {completedRedemptions.slice(0, 10).map((redemption) => {
                    const reward = getRewardById(redemption.rewardId);
                    return (
                      <div key={redemption.id} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-success-500" />
                          </div>
                          <span className="text-2xl">{reward?.image}</span>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{reward?.name}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(redemption.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className="text-secondary-600 font-bold">-{redemption.starsSpent}⭐</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </>
        )}

        {activeTab === 'tasks' && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-800">习惯分配历史</h3>
            </div>

            {taskAssignmentHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-4">暂无分配记录</p>
            ) : (
              <div className="space-y-3">
                {taskAssignmentHistory.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      item.action === 'assigned' ? 'bg-success-100' : 'bg-red-100'
                    )}>
                      {item.action === 'assigned' ? (
                        <Plus className="w-4 h-4 text-success-600" />
                      ) : (
                        <Minus className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <span className="text-2xl">{item.taskIcon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{item.taskName}</div>
                      <div className="text-xs text-gray-500">
                        {item.action === 'assigned' ? '已分配' : '已移除'} · {item.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'stars' && (
          <>
            <Card className="bg-gradient-to-r from-gold-50 to-yellow-50 border-2 border-gold-200">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-gold-600 mb-2">⭐ {totalStars}</div>
                <p className="text-sm text-gray-600">当前星星余额</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-xl font-bold text-success-600">
                    +{starHistory.filter(s => s.type === 'earned').reduce((sum, s) => sum + s.delta, 0)}
                  </div>
                  <div className="text-xs text-gray-600">本周获得</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-xl font-bold text-secondary-600">
                    -{Math.abs(starHistory.filter(s => s.type === 'spent').reduce((sum, s) => sum + s.delta, 0))}
                  </div>
                  <div className="text-xs text-gray-600">本周消耗</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-800">最近14天变化</h3>
              </div>

              {starHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-4">暂无星星变化记录</p>
              ) : (
                <div className="space-y-3">
                  {starHistory.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        item.type === 'earned' ? 'bg-success-100' :
                        item.type === 'spent' ? 'bg-secondary-100' :
                        'bg-gold-100'
                      )}>
                        {item.type === 'earned' ? (
                          <TrendingUp className="w-4 h-4 text-success-600" />
                        ) : item.type === 'spent' ? (
                          <TrendingDown className="w-4 h-4 text-secondary-600" />
                        ) : (
                          <Star className="w-4 h-4 text-gold-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{item.reason}</div>
                        <div className="text-xs text-gray-500">{item.date}</div>
                      </div>
                      <div className={clsx(
                        'text-lg font-bold',
                        item.delta > 0 ? 'text-success-600' : 'text-secondary-600'
                      )}>
                        {item.delta > 0 ? '+' : ''}{item.delta}⭐
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      <Modal
        isOpen={showStarModal}
        onClose={() => setShowStarModal(false)}
        title="调整星星"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gold-600 mb-2">
              {starDelta >= 0 ? '+' : ''}{starDelta}
            </div>
            <p className="text-sm text-gray-500">调整数量</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setStarDelta(d => d - 1)}
              className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
            >
              <Minus className="w-6 h-6" />
            </button>
            <button
              onClick={() => setStarDelta(d => d + 1)}
              className="w-12 h-12 rounded-full bg-success-100 text-success-600 flex items-center justify-center hover:bg-success-200 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-2">
            {[5, 10, 20, -5, -10].map((num) => (
              <button
                key={num}
                onClick={() => setStarDelta(num)}
                className={clsx(
                  'flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
                  starDelta === num
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {num > 0 ? `+${num}` : num}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={starReason}
            onChange={(e) => setStarReason(e.target.value)}
            placeholder="调整原因（可选）"
            className="input"
          />

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowStarModal(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleAdjustStars}
              disabled={starDelta === 0}
              className="flex-1"
              icon={<Star className="w-4 h-4" />}
            >
              确认调整
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEncouragementModal}
        onClose={() => setShowEncouragementModal(false)}
        title="编辑鼓励语"
      >
        <div className="space-y-4">
          <textarea
            value={encouragementText}
            onChange={(e) => setEncouragementText(e.target.value)}
            placeholder="写下你想对孩子说的话..."
            className="input min-h-[120px] resize-none"
            maxLength={200}
          />
          <div className="text-xs text-gray-400 text-right">
            {encouragementText.length}/200
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowEncouragementModal(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleSaveEncouragement}
              className="flex-1"
              icon={<MessageCircle className="w-4 h-4" />}
            >
              保存鼓励语
            </Button>
          </div>
        </div>
      </Modal>

      <BottomNav role="parent" />
    </div>
  );
};
