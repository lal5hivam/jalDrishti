import React from 'react';
import { getGAVIColor, getGAVICategory, GAVI_THRESHOLDS } from '@/types/api';
import { cn } from '@/lib/utils';

interface GAVIBadgeProps {
  gavi: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
};

const GAVIBadge: React.FC<GAVIBadgeProps> = ({
  gavi,
  size = 'md',
  showLabel = true,
  className,
}) => {
  const category = getGAVICategory(gavi);
  const config = GAVI_THRESHOLDS[category];
  const color = getGAVIColor(gavi);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `2px solid ${color}`,
      }}
    >
      {gavi.toFixed(1)}
      {showLabel && (
        <span className="ml-1.5 font-medium opacity-80">({config.label})</span>
      )}
    </span>
  );
};

export default GAVIBadge;
