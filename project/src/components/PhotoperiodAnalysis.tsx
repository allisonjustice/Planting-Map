import React from 'react';
import { format } from 'date-fns';
import { Sun, Moon, Thermometer, Droplets, Info } from 'lucide-react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { PhotoperiodCalculation, WeeklyGrowthData } from '../types';

interface PhotoperiodAnalysisProps {
  photoperiodData: PhotoperiodCalculation | null;
  growthData: any[];
}

export const PhotoperiodAnalysis: React.FC<PhotoperiodAnalysisProps> = ({ photoperiodData, growthData }) => {
  if (!photoperiodData || !photoperiodData.plantingDate || !photoperiodData.floweringInitiationDate) {
    return (
      <div className="bg-emerald-900/20 rounded-xl p-6 border border-emerald-800">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Sun className="w-8 h-8 text-emerald-500 mb-4" />
          <p className="text-emerald-300 max-w-md">
            Enter your growing parameters to view analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-900/20 rounded-xl p-6 border border-emerald-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-emerald-400">Growth Timeline Analysis</h2>
      </div>

      <div className="bg-emerald-950 rounded-lg p-6 border border-emerald-800">
        <h3 className="text-emerald-300 font-medium mb-4">Timeline</h3>
        <div className="space-y-4">
          <div className="bg-emerald-900/30 p-4 rounded-lg border border-emerald-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-emerald-400">Planting</span>
              <span className="text-base font-semibold text-emerald-200">
                {format(photoperiodData.plantingDate, 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-emerald-400">Flowering</span>
              <span className="text-base font-semibold text-emerald-200">
                {format(photoperiodData.floweringInitiationDate, 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-400">Harvest</span>
              <span className="text-base font-semibold text-emerald-200">
                {format(photoperiodData.estimatedHarvestDate, 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};