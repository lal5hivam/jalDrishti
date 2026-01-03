import React from 'react';
import { getAlertConfig } from '@/types/api';
import { cn } from '@/lib/utils';

interface AlertBadgeProps {
  alert: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
};

const AlertBadge: React.FC<AlertBadgeProps> = ({
  alert,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const config = getAlertConfig(alert);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}`,
      }}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </span>
  );
};

export default AlertBadge;
