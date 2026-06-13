import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Family,
  User,
  Task,
  CheckIn,
  Reward,
  Redemption,
  MoodRecord,
  Achievement,
  TemporaryChallenge,
  AppSettings,
  UserRole,
  TaskStats,
  StreakTrend,
  ChildDetail,
  EnhancedReport,
  RepeatType,
} from '../types';
import {
  mockFamily,
  mockUsers,
  mockTasks,
  mockCheckIns,
  mockRewards,
  mockRedemptions,
  mockMoodRecords,
  mockAchievements,
  mockChallenges,
} from '../data/mockData';

interface AppState {
  family: Family;
  users: User[];
  tasks: Task[];
  checkIns: CheckIn[];
  rewards: Reward[];
  redemptions: Redemption[];
  moodRecords: MoodRecord[];
  achievements: Achievement[];
  challenges: TemporaryChallenge[];
  settings: AppSettings;
  currentUser: User | null;
  currentRole: UserRole | null;

  setCurrentUser: (user: User) => void;
  setCurrentRole: (role: UserRole | null) => void;

  getTasksForUser: (userId: string) => Task[];
  getTodayTasks: (userId: string) => Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addCheckIn: (checkIn: Omit<CheckIn, 'id' | 'createdAt'>) => void;
  approveCheckIn: (id: string, approverId: string) => void;
  rejectCheckIn: (id: string) => void;
  getCheckInsForUser: (userId: string) => CheckIn[];

  addReward: (reward: Omit<Reward, 'id' | 'createdAt'>) => void;
  updateReward: (id: string, updates: Partial<Reward>) => void;
  deleteReward: (id: string) => void;

  addRedemption: (redemption: Omit<Redemption, 'id' | 'createdAt'>) => void;
  approveRedemption: (id: string, approverId: string) => void;
  rejectRedemption: (id: string) => void;
  getRedemptionsForUser: (userId: string) => Redemption[];

  addMoodRecord: (record: Omit<MoodRecord, 'id' | 'createdAt'>) => void;
  getMoodRecordsForUser: (userId: string) => MoodRecord[];

  addStars: (userId: string, stars: number) => void;
  deductStars: (userId: string, stars: number) => boolean;

  getPendingApprovals: () => (CheckIn | Redemption)[];
  getUserStars: (userId: string) => number;
  getStreakDays: (userId: string) => number;

  addTemporaryChallenge: (challenge: Omit<TemporaryChallenge, 'id' | 'createdAt'>) => void;
  earnAchievement: (achievementId: string) => void;
  
  addChild: (name: string, avatar: string) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  
  getEnhancedReport: (userId: string, period: 'week' | 'month') => EnhancedReport;
  getStreakTrend: (userId: string, days: number) => StreakTrend[];
  getChildDetail: (userId: string) => ChildDetail;
  
  getEffectiveCheckIn: (userId: string, taskId: string, date: string) => CheckIn | undefined;
  getLatestRedemptionsForReward: (userId: string, rewardId: string) => Redemption | undefined;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      family: mockFamily,
      users: mockUsers,
      tasks: mockTasks,
      checkIns: mockCheckIns,
      rewards: mockRewards,
      redemptions: mockRedemptions,
      moodRecords: mockMoodRecords,
      achievements: mockAchievements,
      challenges: mockChallenges,
      settings: {
        requireApprovalDefault: true,
        reminderTime: '20:00',
        rulesLocked: true,
      },
      currentUser: null,
      currentRole: null,

      setCurrentUser: (user) => set({ currentUser: user }),
      setCurrentRole: (role) => set({ currentRole: role }),

      getTasksForUser: (userId) => {
        return get().tasks.filter(
          (task) => task.isActive && task.assignedTo.includes(userId)
        );
      },

      getTodayTasks: (userId) => {
        const tasks = get().getTasksForUser(userId);
        const today = new Date();
        const dayOfWeek = today.getDay();

        return tasks.filter((task) => {
          if (task.repeatType === 'daily') return true;
          if (task.repeatType === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
          if (task.repeatType === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
          if (task.repeatType === 'custom' && task.repeatDays) {
            return task.repeatDays.includes(dayOfWeek);
          }
          return false;
        });
      },

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: `task-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, isActive: false } : task
          ),
        }));
      },

      addCheckIn: (checkIn) => {
        const task = get().tasks.find((t) => t.id === checkIn.taskId);
        const newCheckIn: CheckIn = {
          ...checkIn,
          id: `checkin-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ checkIns: [...state.checkIns, newCheckIn] }));

        if (task && !task.requireApproval) {
          get().approveCheckIn(newCheckIn.id, 'system');
        }
      },

      approveCheckIn: (id, approverId) => {
        const checkIn = get().checkIns.find((c) => c.id === id);
        if (!checkIn) return;

        set((state) => ({
          checkIns: state.checkIns.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: 'approved',
                  approvedBy: approverId,
                  approvedAt: new Date().toISOString(),
                }
              : c
          ),
        }));

        if (checkIn.status !== 'approved') {
          get().addStars(checkIn.userId, checkIn.starsEarned);
        }
      },

      rejectCheckIn: (id) => {
        set((state) => ({
          checkIns: state.checkIns.map((c) =>
            c.id === id ? { ...c, status: 'rejected' } : c
          ),
        }));
      },

      getCheckInsForUser: (userId) => {
        return get().checkIns.filter((c) => c.userId === userId);
      },

      addReward: (reward) => {
        const newReward: Reward = {
          ...reward,
          id: `reward-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ rewards: [...state.rewards, newReward] }));
      },

      updateReward: (id, updates) => {
        set((state) => ({
          rewards: state.rewards.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteReward: (id) => {
        set((state) => ({
          rewards: state.rewards.map((r) =>
            r.id === id ? { ...r, isActive: false } : r
          ),
        }));
      },

      addRedemption: (redemption) => {
        const newRedemption: Redemption = {
          ...redemption,
          id: `redemption-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ redemptions: [...state.redemptions, newRedemption] }));
      },

      approveRedemption: (id, approverId) => {
        const redemption = get().redemptions.find((r) => r.id === id);
        if (!redemption) return;

        set((state) => ({
          redemptions: state.redemptions.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'approved',
                  processedBy: approverId,
                  processedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      rejectRedemption: (id) => {
        const redemption = get().redemptions.find((r) => r.id === id);
        if (!redemption) return;

        set((state) => ({
          redemptions: state.redemptions.map((r) =>
            r.id === id
              ? { ...r, status: 'rejected', processedAt: new Date().toISOString() }
              : r
          ),
        }));

        get().addStars(redemption.userId, redemption.starsSpent);
      },

      getRedemptionsForUser: (userId) => {
        return get().redemptions.filter((r) => r.userId === userId);
      },

      addMoodRecord: (record) => {
        const newRecord: MoodRecord = {
          ...record,
          id: `mood-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ moodRecords: [...state.moodRecords, newRecord] }));
      },

      getMoodRecordsForUser: (userId) => {
        return get().moodRecords.filter((r) => r.userId === userId);
      },

      addStars: (userId, stars) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, stars: u.stars + stars } : u
          ),
          currentUser: state.currentUser?.id === userId
            ? { ...state.currentUser, stars: state.currentUser.stars + stars }
            : state.currentUser,
        }));
      },

      deductStars: (userId, stars) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user || user.stars < stars) return false;

        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, stars: u.stars - stars } : u
          ),
          currentUser: state.currentUser?.id === userId
            ? { ...state.currentUser, stars: state.currentUser.stars - stars }
            : state.currentUser,
        }));
        return true;
      },

      getPendingApprovals: () => {
        const pendingCheckIns = get()
          .checkIns.filter((c) => c.status === 'pending')
          .map((c) => ({ ...c } as CheckIn | Redemption));

        const pendingRedemptions = get()
          .redemptions.filter((r) => r.status === 'pending')
          .map((r) => ({ ...r } as CheckIn | Redemption));

        return [...pendingCheckIns, ...pendingRedemptions].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },

      getUserStars: (userId) => {
        const user = get().users.find((u) => u.id === userId);
        return user?.stars || 0;
      },

      getStreakDays: (userId) => {
        const checkIns = get()
          .getCheckInsForUser(userId)
          .filter((c) => c.status === 'approved')
          .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());

        if (checkIns.length === 0) return 0;

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const checkIn of checkIns) {
          const checkInDate = new Date(checkIn.checkInDate);
          checkInDate.setHours(0, 0, 0, 0);

          const diffDays = Math.floor(
            (currentDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays <= 1) {
            streak++;
            currentDate = checkInDate;
          } else {
            break;
          }
        }

        return streak;
      },

      addTemporaryChallenge: (challenge) => {
        const newChallenge: TemporaryChallenge = {
          ...challenge,
          id: `challenge-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ challenges: [...state.challenges, newChallenge] }));
      },

      earnAchievement: (achievementId) => {
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === achievementId && !a.earnedAt
              ? { ...a, earnedAt: new Date().toISOString() }
              : a
          ),
        }));
      },

      addChild: (name, avatar) => {
        const family = get().family;
        const newChild: User = {
          id: `child-${Date.now()}`,
          name,
          avatar,
          role: 'child',
          familyId: family.id,
          stars: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ users: [...state.users, newChild] }));
        return newChild;
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        }));
      },

      getEffectiveCheckIn: (userId, taskId, date) => {
        const checkIns = get().checkIns.filter(
          c => c.userId === userId && c.taskId === taskId && c.checkInDate === date
        );
        if (checkIns.length === 0) return undefined;
        return checkIns.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
      },

      getLatestRedemptionsForReward: (userId, rewardId) => {
        const redemptions = get().redemptions.filter(
          r => r.userId === userId && r.rewardId === rewardId
        );
        if (redemptions.length === 0) return undefined;
        return redemptions.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
      },

      getStreakTrend: (userId, days) => {
        const checkIns = get().getCheckInsForUser(userId)
          .filter(c => c.status === 'approved')
          .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());
        
        const trend: StreakTrend[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let currentStreak = 0;
        const completedDates = new Set(checkIns.map(c => c.checkInDate));
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const isCompleted = completedDates.has(dateStr);
          
          if (isCompleted) {
            currentStreak++;
          } else {
            currentStreak = 0;
          }
          
          trend.push({
            date: dateStr,
            streakCount: currentStreak,
            isCompleted,
          });
        }
        
        return trend;
      },

      getChildDetail: (userId) => {
        const user = get().users.find(u => u.id === userId);
        if (!user) {
          return {
            user: user!,
            assignedTasks: [],
            totalStars: 0,
            recentCheckIns: [],
            recentRedemptions: [],
          };
        }
        
        const assignedTasks = get().tasks.filter(
          t => t.isActive && t.assignedTo.includes(userId)
        );
        
        const userCheckIns = get().checkIns
          .filter(c => c.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        const userRedemptions = get().redemptions
          .filter(r => r.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return {
          user,
          assignedTasks,
          totalStars: user.stars,
          lastCheckIn: userCheckIns[0],
          lastRedemption: userRedemptions.find(r => r.status === 'approved'),
          recentCheckIns: userCheckIns.slice(0, 5),
          recentRedemptions: userRedemptions.slice(0, 5),
        };
      },

      getEnhancedReport: (userId, period) => {
        const tasks = get().getTasksForUser(userId);
        const checkIns = get().getCheckInsForUser(userId);
        const redemptions = get().getRedemptionsForUser(userId);
        
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        let startDate: Date;
        let daysCount: number;
        
        if (period === 'week') {
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay());
          startDate.setHours(0, 0, 0, 0);
          daysCount = 7;
        } else {
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          daysCount = Math.min(30, endOfMonth.getDate());
        }
        
        const periodCheckIns = checkIns.filter(c => {
          const date = new Date(c.checkInDate);
          return date >= startDate && date <= today;
        });
        
        const approvedCheckIns = periodCheckIns.filter(c => c.status === 'approved');
        
        const byRepeatType = {
          daily: { total: 0, completed: 0, rate: 0 },
          weekdays: { total: 0, completed: 0, rate: 0 },
          weekends: { total: 0, completed: 0, rate: 0 },
          custom: { total: 0, completed: 0, rate: 0 },
        };
        
        tasks.forEach(task => {
          const repeatType = task.repeatType as RepeatType;
          let expectedDays = 0;
          
          for (let i = 0; i < daysCount; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dayOfWeek = date.getDay();
            
            if (task.repeatType === 'daily') {
              expectedDays++;
            } else if (task.repeatType === 'weekdays') {
              if (dayOfWeek >= 1 && dayOfWeek <= 5) expectedDays++;
            } else if (task.repeatType === 'weekends') {
              if (dayOfWeek === 0 || dayOfWeek === 6) expectedDays++;
            } else if (task.repeatType === 'custom' && task.repeatDays) {
              if (task.repeatDays.includes(dayOfWeek)) expectedDays++;
            }
          }
          
          byRepeatType[repeatType].total += expectedDays;
          
          const taskApprovedCheckIns = approvedCheckIns.filter(c => c.taskId === task.id);
          byRepeatType[repeatType].completed += taskApprovedCheckIns.length;
        });
        
        Object.keys(byRepeatType).forEach(key => {
          const data = byRepeatType[key as keyof typeof byRepeatType];
          data.rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
        });
        
        const totalExpected = Object.values(byRepeatType).reduce((sum, d) => sum + d.total, 0);
        const totalCompleted = Object.values(byRepeatType).reduce((sum, d) => sum + d.completed, 0);
        
        const taskBreakdown: TaskStats[] = tasks.map(task => {
          const taskApprovedCheckIns = approvedCheckIns.filter(c => c.taskId === task.id);
          const completedCount = taskApprovedCheckIns.length;
          const starsEarned = taskApprovedCheckIns.reduce((sum, c) => sum + c.starsEarned, 0);
          
          let taskExpected = byRepeatType[task.repeatType as RepeatType].total / tasks.filter(t => t.repeatType === task.repeatType).length;
          if (taskExpected === 0) taskExpected = daysCount;
          
          return {
            taskId: task.id,
            taskName: task.name,
            taskIcon: task.icon,
            repeatType: task.repeatType,
            completedCount,
            totalCount: Math.round(taskExpected),
            starsEarned,
            completionRate: taskExpected > 0 ? Math.round((completedCount / taskExpected) * 100) : 0,
          };
        });
        
        const streakTrend = get().getStreakTrend(userId, daysCount);
        
        const periodRedemptions = redemptions.filter(r => {
          const date = new Date(r.createdAt);
          return date >= startDate && date <= today;
        });
        
        const totalStarsEarned = approvedCheckIns.reduce((sum, c) => sum + c.starsEarned, 0);
        const totalStarsSpent = periodRedemptions
          .filter(r => r.status === 'approved')
          .reduce((sum, r) => sum + r.starsSpent, 0);
        
        return {
          period,
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
          overallRate: totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0,
          byRepeatType,
          taskBreakdown,
          streakTrend,
          totalStarsEarned,
          totalStarsSpent,
          streakDays: get().getStreakDays(userId),
        };
      },
    }),
    {
      name: 'little-stars-storage',
    }
  )
);
