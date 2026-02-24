import React from 'react';

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  baseColor?: string; 
}

export const Chip: React.FC<ChipProps> = ({ label, selected, onClick, baseColor = 'stone' }) => {
  // Pastel cold tone color mapping for selection state
  const getSelectedStyles = () => {
    switch (baseColor) {
      case 'sky':
        return 'bg-sky-100 text-sky-900 border-sky-200';
      case 'teal':
        return 'bg-teal-100 text-teal-900 border-teal-200';
      case 'violet':
        return 'bg-violet-100 text-violet-900 border-violet-200';
      case 'blue':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      default:
        return 'bg-stone-800 text-white border-stone-800';
    }
  };

  const getUnselectedStyles = () => {
    return 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700 hover:shadow-sm';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out border
        ${selected 
          ? `${getSelectedStyles()} shadow-sm scale-105` 
          : getUnselectedStyles()
        }
      `}
    >
      {label}
    </button>
  );
};