import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Header,
  BottomNav,
  Card,
  Badge,
  Modal,
  Button,
} from '../components';
import { useStore } from '../store';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Star,
  Award,
  ChevronRight,
  BarChart3,
  Target,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Image,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MoodPicker } from '../components/MoodPicker';
import type { MoodType, DailyTimeline } from '../types';
import { clsx } from 'clsx';

type ReportPeriod = 'week' | 'month';
type MonthType = 'calendar' | 'rolling';

export const ChildGrowthPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    achievements,
    addMoodRecord,
    getEnhancedReport,
    getPeriodComparison,
  } = useStore();

  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('week');
  const [monthType, setMonthType] = useState<MonthType>('calendar');
  const [showTimeline, setShowTimeline] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const [moodNote, setMoodNote] = useState('');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [selectedDayDetail, setSelectedDayDetail] = useState<DailyTimeline | null>(null);

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const comparison = useMemo(
    () => getPeriodComparison(currentUser.id, selectedPeriod, monthType),
    [currentUser.id, selectedPeriod, monthType, useStore.getState().checkIns, useStore.getState().tasks]
  );
  
  const report = comparison.current;
  const earnedAchievements = achievements.filter((a) => a.earnedAt);
  const today = new Date();

  const handleSaveMood = () => {
    if (!selectedMood) return;

    addMoodRecord({
      userId: currentUser.id,
      mood: selectedMood,
      note: moodNote || undefined,
      date: today.toISOString().split('T')[0],
    });

    setShowMoodModal(false);
    setSelectedMood(undefined);
    setMoodNote('');
  };

  const repeatTypeLabels: Record<string, string> = {
    daily: '每天',
    weekdays: '工作日',
    weekends: '周末',
    custom: '自定义',
  };

  const repeatTypeColors: Record<string, string> = {
    daily: 'from-orange-400 to-red-500',
    weekdays: 'from-blue-400 to-indigo-500',
    weekends: 'from-green-400 to-emerald-500',
    custom: 'from-purple-400 to-pink-500',
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="成长报告" user={currentUser} showStars />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="text-center mb-4">
            <p className="text-white/80 text-sm mb-1">
              {selectedPeriod === 'week' ? '本周' : '本月'}{monthType === 'rolling' ? '(近30天)' : ''}综合完成率
            </p>
            <div className="text-5xl font-bold mb-2">{report.overallRate}%</div>
            <div className="w-full bg-white/30 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all duration-1000"
                style={{ width: `${report.overallRate}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xs font-semibold opacity-90">连续打卡</div>
              <div className="text-sm font-bold">{report.streakDays}天</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-xs font-semibold opacity-90">获得星星</div>
              <div className="text-sm font-bold">+{report.totalStarsEarned}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🎁</div>
              <div className="text-xs font-semibold opacity-90">消耗星星</div>
              <div className="text-sm font-bold">-{report.totalStarsSpent}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-xs font-semibold opacity-90">获得成就</div>
              <div className="text-sm font-bold">{earnedAchievements.length}个</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-800">报告设置</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={clsx(
                  'flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all',
                  selectedPeriod === 'week'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                周报
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={clsx(
                  'flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all',
                  selectedPeriod === 'month'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                月报
              </button>
            </div>

            {selectedPeriod === 'month' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setMonthType('calendar')}
                  className={clsx(
                    'flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all',
                    monthType === 'calendar'
                      ? 'bg-secondary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  📅 自然月
                </button>
                <button
                  onClick={() => setMonthType('rolling')}
                  className={clsx(
                    'flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all',
                    monthType === 'rolling'
                      ? 'bg-secondary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  📊 近30天
                </button>
              </div>
            )}

            <Button
              onClick={() => setShowTimeline(!showTimeline)}
              variant={showTimeline ? 'primary' : 'ghost'}
              className="w-full"
              icon={<Calendar className="w-4 h-4" />}
            >
              {showTimeline ? '收起' : '展开'}任务时间轴
            </Button>
          </div>
        </Card>

        {comparison.previous && (
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-800">与上一周期对比</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-white/60 rounded-lg">
                <div className={clsx(
                  'text-lg font-bold',
                  comparison.rateChange > 0 ? 'text-success-600' : comparison.rateChange < 0 ? 'text-red-600' : 'text-gray-600'
                )}>
                  {comparison.rateChange > 0 ? '+' : ''}{comparison.rateChange}%
                </div>
                <div className="text-xs text-gray-600">完成率变化</div>
              </div>
              <div className="text-center p-2 bg-white/60 rounded-lg">
                <div className={clsx(
                  'text-lg font-bold',
                  comparison.starsChange > 0 ? 'text-success-600' : comparison.starsChange < 0 ? 'text-red-600' : 'text-gray-600'
                )}>
                  {comparison.starsChange > 0 ? '+' : ''}{comparison.starsChange}⭐
                </div>
                <div className="text-xs text-gray-600">星星变化</div>
              </div>
              <div className="text-center p-2 bg-white/60 rounded-lg">
                <div className={clsx(
                  'text-lg font-bold',
                  comparison.streakChange > 0 ? 'text-success-600' : comparison.streakChange < 0 ? 'text-red-600' : 'text-gray-600'
                )}>
                  {comparison.streakChange > 0 ? '+' : ''}{comparison.streakChange}天
                </div>
                <div className="text-xs text-gray-600">连续打卡变化</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-semibold">上周期</span>
                  {comparison.previous.startDate} ~ {comparison.previous.endDate}
                </div>
                <div>
                  <span className="font-semibold">本周期</span>
                  {report.startDate} ~ {report.endDate}
                </div>
              </div>
            </div>
          </Card>
        )}

        {showTimeline && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-800">任务时间轴</h3>
              </div>
              <span className="text-sm text-gray-500">
                {report.dailyTimeline.length}天
              </span>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {report.dailyTimeline.map((day, dayIdx) => (
                <div key={dayIdx} className="border-b border-gray-100 pb-3 last:border-0">
                  <div 
                    className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg"
                    onClick={() => {
                      if (expandedDate === day.date) {
                        setExpandedDate(null);
                      } else {
                        setExpandedDate(day.date);
                        setSelectedDayDetail(day);
                        setShowDayDetail(true);
                      }
                    }}
                  >
                    <span className="text-sm font-semibold text-gray-700">
                      {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs text-gray-500">周{weekDays[day.dayOfWeek]}</span>
                    <div className="flex-1" />
                    <span className="text-xs text-gray-500">
                      {day.tasks.filter(t => t.isExpected && t.checkIn?.status === 'approved').length}/{day.tasks.filter(t => t.isExpected).length}
                    </span>
                    {expandedDate === day.date ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {day.tasks.filter(t => t.isExpected).map((task) => (
                      <div
                        key={task.taskId}
                        className={clsx(
                          'p-2 rounded-lg text-sm flex items-center gap-2',
                          task.checkIn?.status === 'approved'
                            ? 'bg-success-50 text-success-700'
                            : task.checkIn?.status === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : task.checkIn?.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        <span>{task.taskIcon}</span>
                        <span className="flex-1 truncate">{task.taskName}</span>
                        {task.checkIn?.status === 'approved' ? (
                          <CheckCircle2 className="w-4 h-4 text-success-500" />
                        ) : task.checkIn?.status === 'rejected' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : task.checkIn?.status === 'pending' ? (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <span className="text-xs">未打卡</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-800">按周期分类统计</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(report.byRepeatType) as Array<keyof typeof report.byRepeatType>).map((type) => {
              const data = report.byRepeatType[type];
              if (data.total === 0) return null;
              return (
                <div key={type} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={clsx('w-8 h-8 rounded-lg bg-gradient-to-br', repeatTypeColors[type as keyof typeof repeatTypeColors])} />
                    <span className="font-semibold text-gray-700">{repeatTypeLabels[type as keyof typeof repeatTypeLabels]}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-800">{data.rate}%</span>
                      <p className="text-xs text-gray-500">完成率</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">{data.completed}/{data.total}</span>
                      <p className="text-xs text-gray-500">次</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className={clsx('bg-gradient-to-r rounded-full h-1.5', repeatTypeColors[type as keyof typeof repeatTypeColors])}
                      style={{ width: `${data.rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-gray-800">连续打卡走势</h3>
            </div>
            <span className="text-sm text-gray-500">
              最近{selectedPeriod === 'week' ? '7' : '30'}天
            </span>
          </div>

          <div className="flex items-end justify-between gap-1 h-20">
            {report.streakTrend.map((day, idx) => {
              const maxStreak = Math.max(...report.streakTrend.map(d => d.streakCount), 1);
              const height = day.streakCount > 0 ? (day.streakCount / maxStreak) * 100 : 10;
              const date = new Date(day.date);
              const dayLabel = date.getDate();

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={clsx(
                      'w-full rounded-t-lg transition-all',
                      day.isCompleted
                        ? 'bg-gradient-to-t from-orange-400 to-red-400'
                        : 'bg-gray-200'
                    )}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500">{dayLabel}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gradient-to-t from-orange-400 to-red-400" />
              <span className="text-gray-600">已完成</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-200" />
              <span className="text-gray-600">未完成</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-800">各习惯详情</h3>
            </div>
          </div>

          <div className="space-y-3">
            {report.taskBreakdown.map((stat) => (
              <div key={stat.taskId} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{stat.taskIcon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{stat.taskName}</div>
                    <div className="text-sm text-gray-500">
                      {stat.completedCount} / {stat.totalCount} 次
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gold-600 font-bold">+{stat.starsEarned}⭐</div>
                    <div className="text-xs text-gray-500">{stat.completionRate}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full h-2 transition-all"
                    style={{ width: `${stat.completionRate}%` }}
                  />
                </div>
              </div>
            ))}

            {report.taskBreakdown.length === 0 && (
              <p className="text-center text-gray-500 py-4">暂无习惯数据</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-800">我的成就</h3>
            </div>
            <button className="flex items-center gap-1 text-sm text-primary-600 font-semibold">
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {achievements.slice(0, 8).map((achievement) => (
              <div
                key={achievement.id}
                className={clsx(
                  'text-center p-3 rounded-xl transition-all',
                  achievement.earnedAt
                    ? 'bg-gradient-to-br from-gold-50 to-yellow-50'
                    : 'bg-gray-50 opacity-50'
                )}
              >
                <div className="text-3xl mb-1">{achievement.icon}</div>
                <div className="text-xs font-semibold text-gray-700 truncate">
                  {achievement.name}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 cursor-pointer hover:shadow-card-hover"
          onClick={() => setShowMoodModal(true)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">记录今天的心情</h3>
              <p className="text-sm text-gray-600">点击记录你的情绪小贴纸</p>
            </div>
            <div className="text-4xl">😊</div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        title="记录心情"
      >
        <div className="space-y-4">
          <MoodPicker
            selectedMood={selectedMood}
            onSelect={setSelectedMood}
          />

          <textarea
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
            placeholder="写一些关于今天心情的描述... (可选)"
            className="input min-h-[100px] resize-none"
          />

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowMoodModal(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleSaveMood}
              disabled={!selectedMood}
              className="flex-1"
            >
              保存 😊
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDayDetail}
        onClose={() => {
          setShowDayDetail(false);
          setSelectedDayDetail(null);
          setExpandedDate(null);
        }}
        title={selectedDayDetail ? `${new Date(selectedDayDetail.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} 周${weekDays[selectedDayDetail.dayOfWeek]} 打卡详情` : '打卡详情'}
      >
        {selectedDayDetail && (
          <div className="space-y-4">
            {selectedDayDetail.tasks.filter(t => t.isExpected).length === 0 ? (
              <p className="text-center text-gray-500 py-8">当天没有安排任务</p>
            ) : (
              selectedDayDetail.tasks.filter(t => t.isExpected).map((task) => (
                <div key={task.taskId} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{task.taskIcon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 mb-1">{task.taskName}</div>
                      <div className={clsx(
                        'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                        task.checkIn?.status === 'approved' ? 'bg-success-100 text-success-700' :
                        task.checkIn?.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        task.checkIn?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-200 text-gray-600'
                      )}>
                        {task.checkIn?.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {task.checkIn?.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {task.checkIn?.status === 'pending' && <Clock className="w-3 h-3" />}
                        {task.checkIn?.status === 'approved' ? '已通过' :
                         task.checkIn?.status === 'rejected' ? '已退回' :
                         task.checkIn?.status === 'pending' ? '待审批' : '未打卡'}
                      </div>
                    </div>
                    {task.checkIn && (
                      <div className="text-right">
                        <div className="text-gold-600 font-bold">+{task.checkIn.starsEarned}⭐</div>
                      </div>
                    )}
                  </div>

                  {task.checkIn ? (
                    <div className="space-y-3">
                      {task.checkIn.content && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">打卡内容</div>
                          <div className="text-sm text-gray-700 bg-white p-2 rounded">
                            {task.checkIn.content}
                          </div>
                        </div>
                      )}
                      
                      {task.checkIn.photo && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">打卡照片</div>
                          <img 
                            src={task.checkIn.photo} 
                            alt="打卡照片" 
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {task.checkIn.approvedAt && (
                        <div className="text-xs text-gray-400">
                          审批时间: {new Date(task.checkIn.approvedAt).toLocaleString('zh-CN')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-4">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">当天未打卡</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      <BottomNav role="child" />
    </div>
  );
};
