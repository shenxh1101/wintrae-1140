import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, BottomNav, TaskCard, Modal, Button, Card } from '../components';
import { useStore } from '../store';
import { Camera, FileText, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { encouragementMessages } from '../data/mockData';
import { EncouragementBubble } from '../components/EncouragementBubble';

export const ChildTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, getTodayTasks, checkIns, addCheckIn, tasks } = useStore();

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [checkInContent, setCheckInContent] = useState('');
  const [checkInPhoto, setCheckInPhoto] = useState('');
  const [checkInMode, setCheckInMode] = useState<'text' | 'photo'>('text');
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [photoError, setPhotoError] = useState('');

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const todayTasks = getTodayTasks(currentUser.id);
  const todayDate = new Date().toISOString().split('T')[0];

  const getCheckInForTask = (taskId: string) => {
    return checkIns.find(
      (c) => c.taskId === taskId && c.userId === currentUser.id && c.checkInDate === todayDate
    );
  };

  const selectedTask = useMemo(() => {
    return tasks.find((t) => t.id === selectedTaskId);
  }, [selectedTaskId, tasks]);

  const handleCheckIn = (taskId: string) => {
    setSelectedTaskId(taskId);
    setCheckInContent('');
    setCheckInPhoto('');
    setPhotoError('');
    
    const task = tasks.find((t) => t.id === taskId);
    if (task?.requirePhoto) {
      setCheckInMode('photo');
    } else {
      setCheckInMode('text');
    }
    
    setShowCheckInModal(true);
  };

  const handleModeChange = (mode: 'text' | 'photo') => {
    setCheckInMode(mode);
    setPhotoError('');
  };

  const submitCheckIn = () => {
    if (!selectedTaskId || !currentUser) return;

    const task = todayTasks.find((t) => t.id === selectedTaskId);
    if (!task) return;

    if (task.requirePhoto && !checkInPhoto.trim()) {
      setPhotoError('这个任务需要上传照片才能打卡');
      return;
    }

    addCheckIn({
      taskId: selectedTaskId,
      userId: currentUser.id,
      content: checkInContent,
      photo: checkInPhoto || undefined,
      status: 'pending',
      starsEarned: task.starReward,
      checkInDate: todayDate,
    });

    setShowCheckInModal(false);
    setCheckInContent('');
    setCheckInPhoto('');
    setSelectedTaskId(null);
    setPhotoError('');

    const messages = task.requirePhoto
      ? encouragementMessages.photoUploaded
      : encouragementMessages.taskComplete;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setEncouragementMessage(randomMessage);
    setShowEncouragement(true);
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const today = new Date();
  const dayOfWeek = weekDays[today.getDay()];

  const canSubmit = useMemo(() => {
    if (!selectedTask) return false;
    if (selectedTask.requirePhoto) {
      return !!checkInPhoto.trim();
    }
    return true;
  }, [selectedTask, checkInPhoto]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        user={currentUser}
        showStars
        showNotification
        onNotificationClick={() => navigate('/child/growth')}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            今天的任务 ⭐
          </h2>
          <p className="text-gray-600">
            {today.toLocaleDateString('zh-CN', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>

        <div className="grid gap-4">
          {todayTasks.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                今天的任务都完成了！
              </h3>
              <p className="text-gray-600">明天继续加油哦 💪</p>
            </Card>
          ) : (
            todayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                checkIn={getCheckInForTask(task.id)}
                onCheckIn={() => handleCheckIn(task.id)}
                streakDays={useStore.getState().getStreakDays(currentUser.id)}
              />
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        title={`打卡 - ${selectedTask?.name || ''}`}
      >
        <div className="space-y-4">
          {selectedTask?.requirePhoto && (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 flex items-start gap-2">
              <Camera className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary-800">此任务需要上传照片</p>
                <p className="text-xs text-primary-600 mt-1">请上传完成任务的照片作为打卡凭证</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleModeChange('text')}
              className={clsx(
                'flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2',
                checkInMode === 'text'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <FileText className="w-5 h-5" />
              文字打卡
            </button>
            <button
              onClick={() => handleModeChange('photo')}
              className={clsx(
                'flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2',
                checkInMode === 'photo'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300',
                selectedTask?.requirePhoto && 'border-primary-300 bg-primary-50/50'
              )}
              disabled={selectedTask?.requirePhoto ? false : false}
            >
              <Camera className="w-5 h-5" />
              {selectedTask?.requirePhoto ? '必须拍照' : '拍照打卡'}
            </button>
          </div>

          {photoError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{photoError}</p>
            </div>
          )}

          {checkInMode === 'text' ? (
            <textarea
              value={checkInContent}
              onChange={(e) => setCheckInContent(e.target.value)}
              placeholder="记录一下今天完成任务的感受吧..."
              className="input min-h-[120px] resize-none"
            />
          ) : (
            <div className="space-y-3">
              <input
                type="url"
                value={checkInPhoto}
                onChange={(e) => {
                  setCheckInPhoto(e.target.value);
                  setPhotoError('');
                }}
                placeholder="输入图片URL或粘贴截图"
                className={clsx(
                  'input',
                  photoError && 'border-red-500 focus:border-red-500'
                )}
              />
              {checkInPhoto && (
                <img
                  src={checkInPhoto}
                  alt="预览"
                  className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                  onError={() => setPhotoError('图片链接无效，请检查URL')}
                />
              )}
              {checkInPhoto && !photoError && (
                <textarea
                  value={checkInContent}
                  onChange={(e) => setCheckInContent(e.target.value)}
                  placeholder="添加一些描述... (可选)"
                  className="input min-h-[80px] resize-none"
                />
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowCheckInModal(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={submitCheckIn}
              disabled={!canSubmit}
              className="flex-1"
            >
              提交打卡 ✓
            </Button>
          </div>
        </div>
      </Modal>

      <EncouragementBubble
        message={encouragementMessage}
        isVisible={showEncouragement}
        onClose={() => setShowEncouragement(false)}
      />

      <BottomNav role="child" />
    </div>
  );
};
