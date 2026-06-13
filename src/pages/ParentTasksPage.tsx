import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Header,
  BottomNav,
  Card,
  Button,
  Modal,
  Badge,
} from '../components';
import { useStore } from '../store';
import {
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Camera,
  Star,
  Users,
} from 'lucide-react';
import type { Task, RepeatType } from '../types';
import { clsx } from 'clsx';

export const ParentTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    tasks,
    users,
    addTask,
    updateTask,
    deleteTask,
  } = useStore();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '⭐',
    description: '',
    repeatType: 'daily' as RepeatType,
    repeatDays: [] as number[],
    reminderTime: '20:00',
    starReward: 2,
    requireApproval: true,
    requirePhoto: false,
    assignedTo: [] as string[],
  });

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDaysShort = ['日', '一', '二', '三', '四', '五', '六'];

  const toggleRepeatDay = (dayIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      repeatDays: prev.repeatDays.includes(dayIndex)
        ? prev.repeatDays.filter((d) => d !== dayIndex)
        : [...prev.repeatDays, dayIndex].sort(),
    }));
  };

  const getWeekPreview = () => {
    if (formData.repeatType !== 'custom') return null;
    
    return weekDays.map((day, idx) => {
      const isActive = formData.repeatDays.includes(idx);
      return (
        <div
          key={idx}
          className={clsx(
            'flex-1 text-center p-2 rounded-lg transition-all',
            isActive ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'
          )}
        >
          <div className="text-xs font-semibold">{weekDaysShort[idx]}</div>
          <div className="text-lg">{isActive ? '✓' : '×'}</div>
        </div>
      );
    });
  };

  const getRepeatDescription = () => {
    if (formData.repeatType === 'custom' && formData.repeatDays.length > 0) {
      const days = formData.repeatDays.map(d => weekDaysShort[d]).join('、');
      return `每周${days}`;
    }
    return repeatTypeLabels[formData.repeatType];
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const activeTasks = tasks.filter((t) => t.isActive);
  const children = users.filter((u) => u.role === 'child');

  const openAddModal = () => {
    setEditingTask(null);
    setFormData({
      name: '',
      icon: '⭐',
      description: '',
      repeatType: 'daily',
      repeatDays: [],
      reminderTime: '20:00',
      starReward: 2,
      requireApproval: true,
      requirePhoto: false,
      assignedTo: children.map((c) => c.id),
    });
    setShowTaskModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      icon: task.icon,
      description: task.description,
      repeatType: task.repeatType,
      repeatDays: task.repeatDays || [],
      reminderTime: task.reminderTime,
      starReward: task.starReward,
      requireApproval: task.requireApproval,
      requirePhoto: task.requirePhoto,
      assignedTo: task.assignedTo,
    });
    setShowTaskModal(true);
  };

  const handleSave = () => {
    if (!currentUser) return;

    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask({
        ...formData,
        isActive: true,
        createdBy: currentUser.id,
      });
    }

    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleDelete = (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      deleteTask(taskId);
    }
  };

  const toggleAssigned = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId],
    }));
  };

  const repeatTypeLabels = {
    daily: '每天',
    weekdays: '工作日',
    weekends: '周末',
    custom: '自定义',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="任务管理" user={currentUser} showStars />

      <div className="container mx-auto px-4 py-6">
        <Button onClick={openAddModal} className="w-full mb-6" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          添加新任务
        </Button>

        <div className="space-y-4">
          {activeTasks.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                暂无任务
              </h3>
              <p className="text-gray-600">点击上方按钮添加第一个习惯任务</p>
            </Card>
          ) : (
            activeTasks.map((task) => {
              const assignedChildren = children.filter((c) =>
                task.assignedTo.includes(c.id)
              );

              return (
                <Card key={task.id}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-4xl">{task.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">
                        {task.name}
                      </h3>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="primary">
                      {task.repeatType === 'custom' && task.repeatDays && task.repeatDays.length > 0
                        ? `每周${task.repeatDays.map(d => weekDaysShort[d]).join('、')}`
                        : repeatTypeLabels[task.repeatType]}
                    </Badge>
                    <Badge variant="gold">
                      <Star className="w-3 h-3 mr-1" />
                      {task.starReward}
                    </Badge>
                    {task.requireApproval && (
                      <Badge variant="secondary">需审核</Badge>
                    )}
                    {task.requirePhoto && (
                      <Badge variant="secondary">
                        <Camera className="w-3 h-3 mr-1" />
                        需拍照
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>提醒时间: {task.reminderTime}</span>
                  </div>

                  {assignedChildren.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Users className="w-4 h-4 text-gray-500" />
                      <div className="flex gap-2">
                        {assignedChildren.map((child) => (
                          <span key={child.id} className="text-lg">
                            {child.avatar}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={editingTask ? '编辑任务' : '添加任务'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              任务名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input"
              placeholder="例如：早睡早起"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              选择图标
            </label>
            <div className="grid grid-cols-8 gap-2">
              {['⭐', '🌙', '📚', '⚽', '🧹', '🍳', '💪', '🎨', '🎵', '🏃', '🛏️', '🦷', '✍️', '🌱', '💧', '🥗'].map(
                (emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={clsx(
                      'text-2xl p-2 rounded-lg transition-all',
                      formData.icon === emoji
                        ? 'bg-primary-100 border-2 border-primary-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    )}
                  >
                    {emoji}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              任务描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input min-h-[80px] resize-none"
              placeholder="描述这个任务的具体要求..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                重复周期
              </label>
              <select
                value={formData.repeatType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    repeatType: e.target.value as RepeatType,
                  })
                }
                className="input"
              >
                <option value="daily">每天</option>
                <option value="weekdays">工作日</option>
                <option value="weekends">周末</option>
                <option value="custom">自定义</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                提醒时间
              </label>
              <input
                type="time"
                value={formData.reminderTime}
                onChange={(e) =>
                  setFormData({ ...formData, reminderTime: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          {formData.repeatType === 'custom' && (
            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                选择重复的星期
              </label>
              <div className="grid grid-cols-7 gap-2 mb-3">
                {weekDays.map((day, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleRepeatDay(idx)}
                    className={clsx(
                      'p-3 rounded-xl text-center transition-all',
                      formData.repeatDays.includes(idx)
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    )}
                  >
                    <div className="text-xs font-semibold">{weekDaysShort[idx]}</div>
                  </button>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">本周预览：</span>
                  {formData.repeatDays.length === 0 ? (
                    <span className="text-gray-400">请选择至少一天</span>
                  ) : (
                    <span className="text-primary-600 font-semibold">
                      {weekDaysShort.filter((_, idx) => formData.repeatDays.includes(idx)).join('、')} 会出现
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {getWeekPreview()}
                </div>
                {formData.repeatDays.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    每周将出现 {formData.repeatDays.length} 次
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              星星奖励: {formData.starReward}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.starReward}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  starReward: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.requireApproval}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requireApproval: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-gray-300 text-primary-600"
              />
              <span className="text-sm text-gray-700">需要家长审核</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.requirePhoto}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirePhoto: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-gray-300 text-primary-600"
              />
              <span className="text-sm text-gray-700">需要拍照上传</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              分配给
            </label>
            <div className="space-y-2">
              {children.map((child) => (
                <label
                  key={child.id}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                    formData.assignedTo.includes(child.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={formData.assignedTo.includes(child.id)}
                    onChange={() => toggleAssigned(child.id)}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600"
                  />
                  <span className="text-2xl">{child.avatar}</span>
                  <span className="font-semibold text-gray-800">
                    {child.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowTaskModal(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button onClick={handleSave} className="flex-1">
              保存
            </Button>
          </div>
        </div>
      </Modal>

      <BottomNav role="parent" />
    </div>
  );
};
