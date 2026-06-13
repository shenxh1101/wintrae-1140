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
  Calendar,
  Star,
  Award,
  ChevronRight,
  BarChart3,
  Target,
  Flame,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { MoodPicker } from '../components/MoodPicker';
import type { MoodType } from '../types';
import { clsx } from 'clsx';

type ReportPeriod = 'week' | 'month';

export const ChildGrowthPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    achievements,
    addMoodRecord,
    getEnhancedReport,
  } = useStore();

  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('week');
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const [moodNote, setMoodNote] = useState('');

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const report = useMemo(
    () => getEnhancedReport(currentUser.id, selectedPeriod),
    [currentUser.id, selectedPeriod, useStore.getState().checkIns, useStore.getState().tasks]
  );

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

  const repeatTypeLabels = {
    daily: '每天',
    weekdays: '工作日',
    weekends: '周末',
    custom: '自定义',
  };

  const repeatTypeColors = {
    daily: 'from-orange-400 to-red-500',
    weekdays: 'from-blue-400 to-indigo-500',
    weekends: 'from-green-400 to-emerald-500',
    custom: 'from-purple-400 to-pink-500',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="成长报告" user={currentUser} showStars />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="text-center mb-4">
            <p className="text-white/80 text-sm mb-1">
              {selectedPeriod === 'week' ? '本周' : '本月'}综合完成率
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
              <h3 className="font-bold text-gray-800">按周期分类统计</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={clsx(
                  'px-3 py-1 rounded-full text-sm font-semibold transition-all',
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
                  'px-3 py-1 rounded-full text-sm font-semibold transition-all',
                  selectedPeriod === 'month'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                月报
              </button>
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

      <BottomNav role="child" />
    </div>
  );
};
