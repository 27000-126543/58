import { type ReactNode } from 'react';
import { Users, Clock, Activity, UtensilsCrossed, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MetricType = 'visitors' | 'waitTime' | 'availability' | 'turnover';

interface MetricCardProps {
  type: MetricType;
  title: string;
  value: number | string;
  unit?: string;
  change: number;
  changeLabel?: string;
  icon?: ReactNode;
}

const metricConfig: Record<MetricType, {
  gradient: string;
  iconBg: string;
  iconColor: string;
  icon: ReactNode;
  border: string;
}> = {
  visitors: {
    gradient: 'from-accent-teal/20 via-accent-teal/10 to-transparent',
    iconBg: 'bg-accent-teal/20',
    iconColor: 'text-accent-teal',
    icon: <Users className="w-6 h-6" />,
    border: 'border-accent-teal/20',
  },
  waitTime: {
    gradient: 'from-accent-orange/20 via-accent-orange/10 to-transparent',
    iconBg: 'bg-accent-orange/20',
    iconColor: 'text-accent-orange',
    icon: <Clock className="w-6 h-6" />,
    border: 'border-accent-orange/20',
  },
  availability: {
    gradient: 'from-accent-purple/20 via-accent-purple/10 to-transparent',
    iconBg: 'bg-accent-purple/20',
    iconColor: 'text-accent-purple',
    icon: <Activity className="w-6 h-6" />,
    border: 'border-accent-purple/20',
  },
  turnover: {
    gradient: 'from-accent-gold/20 via-accent-gold/10 to-transparent',
    iconBg: 'bg-accent-gold/20',
    iconColor: 'text-accent-gold',
    icon: <UtensilsCrossed className="w-6 h-6" />,
    border: 'border-accent-gold/20',
  },
};

export default function MetricCard({
  type,
  title,
  value,
  unit,
  change,
  changeLabel = '同比昨日',
  icon,
}: MetricCardProps) {
  const config = metricConfig[type];
  const isPositive = change >= 0;
  const isGood = type === 'availability' || type === 'turnover' || type === 'visitors' ? isPositive : !isPositive;

  return (
    <div
      className={cn(
        'relative p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-sm',
        'overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        config.gradient,
        config.border
      )}
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        {/* 顶部：图标和标题 */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-2.5 rounded-xl', config.iconBg)}>
            <span className={config.iconColor}>
              {icon || config.icon}
            </span>
          </div>
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
            isGood
              ? 'text-accent-teal bg-accent-teal/10'
              : 'text-accent-red bg-accent-red/10'
          )}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        </div>

        {/* 数值 */}
        <div className="mb-1">
          <span className="font-mono text-3xl font-bold text-white tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-metal-400 text-sm ml-1.5">{unit}</span>
          )}
        </div>

        {/* 标题和变化说明 */}
        <div className="flex items-center justify-between">
          <span className="text-metal-300 text-sm font-medium">{title}</span>
          <span className="text-metal-500 text-xs">{changeLabel}</span>
        </div>
      </div>
    </div>
  );
}
