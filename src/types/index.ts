export type UserRole = 'parent' | 'child';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  familyId: string;
  stars: number;
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  avatar: string;
  inviteCode: string;
  createdAt: string;
}

export type RepeatType = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Task {
  id: string;
  name: string;
  icon: string;
  description: string;
  repeatType: RepeatType;
  repeatDays?: number[];
  reminderTime: string;
  starReward: number;
  requireApproval: boolean;
  requirePhoto: boolean;
  assignedTo: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export type CheckInStatus = 'pending' | 'approved' | 'rejected';

export interface CheckIn {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  photo?: string;
  status: CheckInStatus;
  starsEarned: number;
  checkInDate: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  starCost: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export type RedemptionStatus = 'pending' | 'approved' | 'rejected';

export interface Redemption {
  id: string;
  rewardId: string;
  reward?: Reward;
  userId: string;
  status: RedemptionStatus;
  starsSpent: number;
  createdAt: string;
  processedBy?: string;
  processedAt?: string;
}

export type MoodType = 'happy' | 'excited' | 'neutral' | 'sad' | 'angry';

export interface MoodRecord {
  id: string;
  userId: string;
  mood: MoodType;
  note?: string;
  date: string;
  createdAt: string;
}

export interface TemporaryChallenge {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  starReward: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface AppSettings {
  requireApprovalDefault: boolean;
  reminderTime: string;
  rulesLocked: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'tasks' | 'stars' | 'special';
  earnedAt?: string;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  starsEarned: number;
  streakDays: number;
  taskBreakdown: {
    taskId: string;
    taskName: string;
    completed: number;
  }[];
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalStarsEarned: number;
  totalStarsSpent: number;
  streakDays: number;
  achievements: Achievement[];
}
