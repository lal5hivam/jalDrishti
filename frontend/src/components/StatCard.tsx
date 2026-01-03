import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
  className?: string;
}

const colorClasses = {
  primary: 'bg-primary-50 border-primary-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  danger: 'bg-red-50 border-red-200',
  default: 'bg-gray-50 border-gray-200',
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'default',
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border-2 p-6 transition-all hover:shadow-lg',
        colorClasses[color],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        {icon && <div className="text-4xl ml-4">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-sm">
          {trend === 'up' && <span className="text-green-600">↑ Improving</span>}
          {trend === 'down' && <span className="text-red-600">↓ Declining</span>}
          {trend === 'neutral' && <span className="text-gray-600">→ Stable</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
