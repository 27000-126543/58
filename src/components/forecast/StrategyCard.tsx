import { useState } from 'react';
import {
  Clock,
  Mic2,
  Zap,
  Users,
  CheckCircle2,
  Target,
  Sparkles,
} from 'lucide-react';
import type { StrategyRecommendation, StrategyType, PriorityType } from '@/types';
import { cn } from '@/lib/utils';

interface StrategyCardProps {
  strategy: StrategyRecommendation;
}

const strategyIconMap: Record<StrategyType, { icon: typeof Clock; bg: string; text: string }> = {
  extend_hours: { icon: Clock, bg: 'bg-accent-orange/15', text: 'text-accent-orange' },
  add_shows: { icon: Mic2, bg: 'bg-accent-purple/15', text: 'text-accent-purple' },
  open_fast_pass: { icon: Zap, bg: 'bg-accent-teal/15', text: 'text-accent-teal' },
  add_staff: { icon: Users, bg: 'bg-accent-gold/15', text: 'text-accent-gold' },
};

const priorityConfig: Record<PriorityType, { label: string; bg: string; text: string; border: string }> = {
  high: { label: '高优先级', bg: 'bg-accent-red/15', text: 'text-accent-red', border: 'border-accent-red/30' },
  medium: { label: '中优先级', bg: 'bg-accent-orange/15', text: 'text-accent-orange', border: 'border-accent-orange/30' },
  low: { label: '低优先级', bg: 'bg-accent-teal/15', text: 'text-accent-teal', border: 'border-accent-teal/30' },
};

export default function StrategyCard({ strategy }: StrategyCardProps) {
  const [adopted, setAdopted] = useState(false);
  const iconConfig = strategyIconMap[strategy.type];
  const priority = priorityConfig[strategy.priority];
  const Icon = iconConfig.icon;

  return (
    <div className={cn(
      'relative bg-navy-800/60 backdrop-blur-sm rounded-2xl border p-5 transition-all duration-300',
      adopted
        ? 'border-accent-teal/40 bg-accent-teal/5'
        : 'border-navy-700/50 hover:border-navy-600/70 hover:-translate-y-1 hover:shadow-card-dark'
    )}>
      {adopted && (
        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden rounded-tr-2xl pointer-events-none">
          <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-1 rotate-45 bg-accent-teal/20 w-20 h-5" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={cn('p-2.5 rounded-xl flex-shrink-0', iconConfig.bg)}>
          <Icon className={cn('w-5 h-5', iconConfig.text)} />
        </div>
        <span className={cn(
          'px-2.5 py-1 rounded-lg text-xs font-medium border',
          priority.bg, priority.text, priority.border
        )}>
          {priority.label}
        </span>
      </div>

      <h4 className="text-white font-semibold text-base mb-2 leading-snug">
        {strategy.title}
      </h4>
      <p className="text-metal-400 text-sm leading-relaxed mb-3">
        {strategy.description}
      </p>

      <div className="bg-navy-900/50 rounded-xl p-3 mb-4 border border-navy-700/30">
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-accent-teal flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-metal-300 text-xs font-medium mb-0.5">预期影响</p>
            <p className="text-white text-sm">{strategy.expectedImpact}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            <span className="text-metal-400 text-xs font-medium">置信度</span>
          </div>
          <span className="text-white font-mono text-sm font-bold">{strategy.confidence}%</span>
        </div>
        <div className="h-2 w-full bg-navy-700/60 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-accent-teal to-accent-gold"
            style={{ width: `${strategy.confidence}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => setAdopted(!adopted)}
        className={cn(
          'w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2',
          adopted
            ? 'bg-accent-teal/20 text-accent-teal border border-accent-teal/30'
            : 'bg-gradient-to-r from-navy-600 to-navy-500 text-white hover:from-navy-500 hover:to-navy-400 border border-navy-500/50'
        )}
      >
        {adopted ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            已采纳
          </>
        ) : (
          '采纳建议'
        )}
      </button>
    </div>
  );
}
