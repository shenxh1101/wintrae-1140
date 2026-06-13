import React, { useState } from 'react';
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
} from 'lucide-react';
import { MoodPicker } from '../components/MoodPicker';
import type { MoodType } from '../types';
import { clsx } from 'clsx';

type ReportPeriod = 'week' | 'month';

export const ChildGrowthPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    checkIns,
    tasks,
    achievements,
    addMoodRecord,
    getStreakDays,
  } = useStore();

  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('week');
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const [moodNote, setMoodNote] = useState('');

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const userCheckIns = checkIns.filter(
    (c) => c.userId === currentUser.id && c.status === 'approved'
  );

  const streakDays = getStreakDays(currentUser.id);
  const totalStars = currentUser.stars;
  const earnedAchievements = achievements.filter((a) => a.earnedAt);

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weekCheckIns = userCheckIns.filter((c) => {
    const date = new Date(c.checkInDate);
    return date >= weekAgo && date <= today;
  });

  const completionRate = userCheckIns.length > 0
    ? Math.round((weekCheckIns.length / 7) * 100)
    : 0;

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

  const stats = [
    {
      icon: '🔥',
      label: '连续打卡',
      value: `${streakDays}天`,
      color: 'from-orange-400 to-red-500',
    },
    {
      icon: '⭐',
      label: '我的星星',
      value: `${totalStars}颗`,
      color: 'from-gold-400 to-yellow-500',
    },
    {
      icon: '🏆',
      label: '获得成就',
      value: `${earnedAchievements.length}个`,
      color: 'from-purple-400 to-pink-500',
    },
    {
      icon: '✅',
      label: '本周完成',
      value: `${weekCheckIns.length}次`,
      color: 'from-green-400 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="成长记录"
        user={currentUser}
        showStars
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <div className="text-center mb-4">
            <p className="text-white/80 text-sm mb-1">本周任务完成率</p>
            <div className="text-5xl font-bold mb-2">{completionRate}%</div>
            <div className="w-full bg-white/30 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all duration-1000"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-xs font-semibold opacity-90">
                  {stat.label}
                </div>
                <div className="text-sm font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-800">成长报告</h3>
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

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">任务完成数</span>
              </div>
              <span className="font-bold text-gray-800">
                {selectedPeriod === 'week' ? weekCheckIns.length : weekCheckIns.length * 4} 次
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-gold-500" />
                <span className="text-gray-700">获得星星</span>
              </div>
              <span className="font-bold text-gold-600">
                +{selectedPeriod === 'week' ? weekCheckIns.reduce((sum, c) => sum + c.starsEarned, 0) : weekCheckIns.reduce((sum, c) => sum + c.starsEarned, 0) * 4} 颗
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-success-500" />
                <span className="text-gray-700">进步最大</span>
              </div>
              <span className="font-bold text-gray-800">阅读 📚</span>
            </div>
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
