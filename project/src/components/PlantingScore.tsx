import React from 'react';
import { Trophy, Award, Star } from 'lucide-react';
import type { PlantingScore as PlantingScoreType } from '../types';
import * as Progress from '@radix-ui/react-progress';

interface PlantingScoreProps {
  score: PlantingScoreType;
}

export function PlantingScore({ score }: PlantingScoreProps) {
  return (
    <div className="bg-emerald-900/20 rounded-xl p-6 border border-emerald-800">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h3 className="text-lg font-semibold text-emerald-400">Planting Score</h3>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-emerald-400">{score.total}</span>
          </div>
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#065f46"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#10b981"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(score.total / 100) * 352} 352`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {Object.entries(score.breakdown).map(([key, value]) => (
          <div key={key} className="bg-emerald-950 rounded-lg p-4">
            <div className="text-sm text-emerald-400 mb-2">
              {key.split(/(?=[A-Z])/).join(' ')}
            </div>
            <Progress.Root 
              className="h-2 overflow-hidden bg-emerald-900 rounded-full"
              value={value}
            >
              <Progress.Indicator
                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${(value / 25) * 100}%` }}
              />
            </Progress.Root>
            <div className="text-right text-sm text-emerald-300 mt-1">
              {value}/25
            </div>
          </div>
        ))}
      </div>

      {score.achievements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-emerald-400" />
            <h4 className="text-emerald-300 font-medium">Achievements Unlocked</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {score.achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className="bg-emerald-950 rounded-lg p-3 border border-emerald-800 flex items-center gap-3"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <div className="text-sm font-medium text-emerald-300">
                    {achievement.title}
                  </div>
                  <div className="text-xs text-emerald-500">
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}