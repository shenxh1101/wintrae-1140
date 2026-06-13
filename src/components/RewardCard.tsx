import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import type { Reward } from '../types';
import { Star } from 'lucide-react';

interface RewardCardProps {
  reward: Reward;
  userStars: number;
  onRedeem: () => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  userStars,
  onRedeem,
}) => {
  const canAfford = userStars >= reward.starCost;

  return (
    <Card className="relative overflow-hidden" hover>
      <div className="text-6xl mb-3 text-center">{reward.image}</div>

      <div className="text-center">
        <h3 className="font-bold text-lg text-gray-800 mb-1">{reward.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{reward.description}</p>

        <div className="flex items-center justify-center gap-2 mb-3">
          <Star className="w-5 h-5 text-gold-500 fill-current" />
          <span className="text-2xl font-bold text-gold-600">
            {reward.starCost}
          </span>
        </div>

        <Button
          onClick={onRedeem}
          disabled={!canAfford}
          className="w-full"
          variant={canAfford ? 'primary' : 'ghost'}
          icon={canAfford ? '🎁' : undefined}
        >
          {canAfford ? '立即兑换' : '星星不足'}
        </Button>

        {!canAfford && (
          <p className="text-xs text-gray-500 mt-2">
            还差 {reward.starCost - userStars} 颗星星
          </p>
        )}
      </div>
    </Card>
  );
};
