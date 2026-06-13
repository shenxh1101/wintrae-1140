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
        }));
      },

      deductStars: (userId, stars) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user || user.stars < stars) return false;

        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, stars: u.stars - stars } : u
          ),
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
    }),
    {
      name: 'little-stars-storage',
    }
  )
);
