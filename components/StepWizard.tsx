import React from 'react';
import { Check } from 'lucide-react';

interface StepWizardProps {
  currentStep: number;
  totalSteps: number;
}

export const StepWizard: React.FC<StepWizardProps> = ({ currentStep, totalSteps }) => {
  const steps = [
    'Platform',
    'Service',
    'Quantity',
    'Details',
    'Checkout'
  ];

  return (
    <div className="w-full py-6">
      <div className="flex justify-between items-center relative">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10 rounded-full"></div>
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 -z-10 transition-all duration-300 rounded-full"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>

        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={label} className="flex flex-col items-center group">
              <div 
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-slate-950
                ${isActive ? 'border-fuchsia-500 text-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)] scale-110' : ''}
                ${isCompleted ? 'border-violet-500 bg-violet-500 text-white' : 'border-slate-700 text-slate-500'}
                `}
              >
                {isCompleted ? <Check size={16} /> : <span className="text-xs md:text-sm font-bold">{stepNum}</span>}
              </div>
              <span className={`mt-2 text-[10px] md:text-xs font-medium uppercase tracking-wider transition-colors duration-300
                ${isActive || isCompleted ? 'text-slate-200' : 'text-slate-600'}
              `}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
