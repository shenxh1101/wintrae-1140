import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import type { Task, CheckIn } from '../types';
import { Clock, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface TaskCardProps {
  task: Task;
  checkIn?: CheckIn;
  onCheckIn: () => void;
  streakDays?: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  checkIn,
  onCheckIn,
  streakDays = 0,
}) => {
  const getStatus = () => {
    if (!checkIn) return 'pending';
    return checkIn.status;
  };

  const status = getStatus();

  const statusConfig = {
    pending: {
      text: '待打卡',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      badge: <Badge variant="secondary">待打卡</Badge>,
    },
    approved: {
      text: '已完成',
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      badge: <Badge variant="success">✓ 已完成</Badge>,
    },
    rejected: {
      text: '待修改',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      badge: <Badge variant="danger">需修改</Badge>,
    },
  };

  const config = statusConfig[status];

  return (
    <Card className="relative overflow-hidden" hover>
      <div className="flex items-start gap-4">
        <div className="text-5xl">{task.icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg text-gray-800">{task.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            </div>
            {config.badge}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{task.reminderTime}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gold-600 font-bold">
              <span>⭐</span>
              <span>+{task.starReward}</span>
            </div>
            {task.requirePhoto && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Camera className="w-4 h-4" />
                <span>需拍照</span>
              </div>
            )}
            {streakDays > 0 && (
              <Badge variant="gold" size="sm">
                🔥 {streakDays}天
              </Badge>
            )}
          </div>

          {status === 'pending' || status === 'rejected' ? (
            <Button
              onClick={onCheckIn}
              className="w-full"
              size="lg"
              icon={
                status === 'rejected' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )
              }
            >
              {status === 'rejected' ? '重新打卡' : '立即打卡'}
            </Button>
          ) : (
            <div className={clsx('p-3 rounded-xl', config.bgColor)}>
              <p className={clsx('text-sm font-semibold', config.color)}>
                {checkIn?.content || '已打卡完成'}
              </p>
              {checkIn?.photo && (
                <img
                  src={checkIn.photo}
                  alt="打卡照片"
                  className="mt-2 rounded-lg w-full h-32 object-cover"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
