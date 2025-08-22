import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { MapPin, Calendar, Clock, ThermometerSun } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import type { GrowthParameters } from '../types';

interface GrowthParametersFormProps {
  parameters: GrowthParameters;
  onParametersChange: (parameters: GrowthParameters) => void;
  onSubmit: () => void;
}

export const GrowthParametersForm: React.FC<GrowthParametersFormProps> = ({
  parameters,
  onParametersChange,
  onSubmit
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-emerald-400 mb-1.5">Location (ZIP Code)</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-emerald-500" />
          <input
            type="text"
            value={parameters.zipCode}
            onChange={(e) => onParametersChange({ ...parameters, zipCode: e.target.value })}
            placeholder="Enter ZIP code"
            className="w-full bg-emerald-950 rounded-lg pl-10 pr-4 py-2 text-sm border border-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100"
            maxLength={5}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-emerald-400 mb-1.5">Planting Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-emerald-500" />
            <DatePicker
              selected={parameters.plantingDate}
              onChange={(date) => onParametersChange({ ...parameters, plantingDate: date || new Date() })}
              className="w-full bg-emerald-950 rounded-lg pl-10 pr-4 py-2 text-sm border border-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-emerald-400 mb-1.5">Critical Photoperiod Threshold</label>
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 h-5 w-5 text-emerald-500" />
            <input
              type="time"
              value={parameters.criticalPhotoperiodThreshold}
              onChange={(e) => onParametersChange({ ...parameters, criticalPhotoperiodThreshold: e.target.value })}
              className="w-full bg-emerald-950 rounded-lg pl-10 pr-4 py-2 text-sm border border-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm text-emerald-400 mb-1.5">Frost Risk Tolerance (%)</label>
        <div className="relative">
          <ThermometerSun className="absolute left-3 top-2.5 h-5 w-5 text-emerald-500" />
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-9"
            value={[parameters.frostRiskTolerance]}
            max={100}
            step={1}
            onValueChange={(values) => onParametersChange({ ...parameters, frostRiskTolerance: values[0] })}
          >
            <Slider.Track className="bg-emerald-950 relative grow rounded-lg h-9 border border-emerald-800">
              <Slider.Range className="absolute bg-emerald-500 rounded-lg h-full" />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-emerald-100">
                {parameters.frostRiskTolerance}%
              </div>
            </Slider.Track>
            <Slider.Thumb
              className="block w-5 h-5 bg-white rounded-full shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Frost Risk Tolerance"
            />
          </Slider.Root>
        </div>
      </div>

      <div>
        <label className="block text-sm text-emerald-400 mb-1.5">Flowering Time (Weeks)</label>
        <select
          value={parameters.floweringWeeks}
          onChange={(e) => onParametersChange({ ...parameters, floweringWeeks: parseInt(e.target.value) })}
          className="w-full bg-emerald-950 rounded-lg px-4 py-2 text-sm border border-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-emerald-100"
        >
          {[6, 7, 8, 9, 10, 11, 12].map(weeks => (
            <option key={weeks} value={weeks}>{weeks} weeks</option>
          ))}
        </select>
      </div>

      <button
        onClick={onSubmit}
        className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-500 transition-colors duration-200"
      >
        Calculate Growth Timeline
      </button>
    </div>
  );
};