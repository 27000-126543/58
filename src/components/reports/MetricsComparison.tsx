import { AlertTriangle, Frown, Repeat, Clock, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeeklyReport } from '@/types';

interface MetricsComparisonProps {
  reports: WeeklyReport[];
  selectedIndex: number;
}

type MetricKey = 'equipmentFaultRate' | 'visitorComplaintRate' | 'rideTurnoverRate' | 'avgWaitTime' | 'totalVisitors';

interface MetricConfig {
  key: MetricKey;
  title: string;
  unit: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  gradient: string;
  border: string;
  lowerIsBetter: boolean;
  formatValue: (v: number) => string;
}

const metricConfigs: MetricConfig[] = [
  {
    key: 'equipmentFaultRate',
    title: '设备故障率',
    unit: '%',
    icon: <AlertTriangle className="w-5 h-5" />,
    iconBg: 'bg-accent-red/20',
    iconColor: 'text-accent-red',
    gradient: 'from-accent-red/15 via-accent-red/5 to-transparent',
    border: 'border-accent-red/20',
    lowerIsBetter: true,
    formatValue: (v) => v.toFixed(1),
  },
  {
    key: 'visitorComplaintRate',
    title: '游客投诉率',
    unit: '%',
    icon: <Frown className="w-5 h-5" />,
    iconBg: 'bg-accent-orange/20',
    iconColor: 'text-accent-orange',
    gradient: 'from-accent-orange/15 via-accent-orange/5 to-transparent',
    border: 'border-accent-orange/20',
    lowerIsBetter: true,
    formatValue: (v) => v.toFixed(2),
  },
  {
    key: 'rideTurnoverRate',
    title: '项目周转率',
    unit: '次',
    icon: <Repeat className="w-5 h-5" />,
    iconBg: 'bg-accent-purple/20',
    iconColor: 'text-accent-purple',
    gradient: 'from-accent-purple/15 via-accent-purple/5 to-transparent',
    border: 'border-accent-purple/20',
    lowerIsBetter: false,
    formatValue: (v) => v.toFixed(1),
  },
  {
    key: 'avgWaitTime',
    title: '平均等待时间',
    unit: '分钟',
    icon: <Clock className="w-5 h-5" />,
    iconBg: 'bg-accent-gold/20',
    iconColor: 'text-accent-gold',
    gradient: 'from-accent-gold/15 via-accent-gold/5 to-transparent',
    border: 'border-accent-gold/20',
    lowerIsBetter: true,
    formatValue: (v) => v.toFixed(0),
  },
  {
    key: 'totalVisitors',
    title: '周客流总量',
    unit: '人次',
    icon: <Users className="w-5 h-5" />,
    iconBg: 'bg-accent-teal/20',
    iconColor: 'text-accent-teal',
    gradient: 'from-accent-teal/15 via-accent-teal/5 to-transparent',
    border: 'border-accent-teal/20',
    lowerIsBetter: false,
    formatValue: (v) => v.toLocaleString(),
  },
];

function calcChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function Sparkline({
  data,
  color,
  lowerIsBetter,
}: {
  data: number[];
  color: string;
  lowerIsBetter: boolean;
}) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const normalized = data.map((d) => (d - min) / range);

  const width = 100;
  const height = 28;
  const step = width / (data.length - 1 || 1);

  const points = normalized.map((n, i) => {
    const x = i * step;
    const y = lowerIsBetter ? height - n * height : n * height;
    return `${x},${y}`;
  });

  const areaPoints = [`0,${height}`, ...points, `${width},${height}`].join(' ');

  return (
    <div className="w-full h-7 flex items-end">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`spark-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#spark-grad-${color.replace('#', '')})`} />
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((_, i) => {
          const n = normalized[i];
          const cx = i * step;
          const cy = lowerIsBetter ? height - n * height : n * height;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={i === data.length - 1 ? 2.5 : 1.5}
              fill={color}
            />
          );
        })}
      </svg>
    </div>
  );
}

function ChangeIndicator({
  value,
  lowerIsBetter,
  label,
}: {
  value: number;
  lowerIsBetter: boolean;
  label: string;
}) {
  const isUp = value > 0;
  const isGood = lowerIsBetter ? !isUp : isUp;
  const isNeutral = Math.abs(value) < 0.05;

  return (
    <div className="flex items-center gap-1.5">
      {isNeutral ? (
        <span className="text-metal-500 text-xs">—</span>
      ) : isUp ? (
        <TrendingUp className={cn('w-3 h-3', isGood ? 'text-accent-teal' : 'text-accent-red')} />
      ) : (
        <TrendingDown className={cn('w-3 h-3', isGood ? 'text-accent-teal' : 'text-accent-red')} />
      )}
      <span
        className={cn(
          'text-xs font-semibold',
          isNeutral
            ? 'text-metal-500'
            : isGood
            ? 'text-accent-teal'
            : 'text-accent-red'
        )}
      >
        {isNeutral ? '持平' : `${isUp ? '+' : ''}${value.toFixed(1)}%`}
      </span>
      <span className="text-metal-500 text-xs">{label}</span>
    </div>
  );
}

export default function MetricsComparison({ reports, selectedIndex }: MetricsComparisonProps) {
  const currentReport = reports[selectedIndex];
  if (!currentReport) return null;

  const sparklineColors: Record<MetricKey, string> = {
    equipmentFaultRate: '#EF476F',
    visitorComplaintRate: '#FF6B35',
    rideTurnoverRate: '#9B5DE5',
    avgWaitTime: '#FFD166',
    totalVisitors: '#00D4AA',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metricConfigs.map((config) => {
        const metric = currentReport.metrics[config.key];
        const wowChange = calcChange(metric.current, metric.lastWeek);
        const yoyChange = calcChange(metric.current, metric.lastYear);

        const sparklineData = reports
          .slice()
          .reverse()
          .map((r) => r.metrics[config.key].current);

        return (
          <div
            key={config.key}
            className={cn(
              'relative p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-sm',
              'overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
              config.gradient,
              config.border
            )}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className={cn('p-2 rounded-xl', config.iconBg)}>
                  <span className={config.iconColor}>{config.icon}</span>
                </div>
              </div>

              <div>
                <span className="text-metal-300 text-xs font-medium">{config.title}</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-mono text-2xl font-bold text-white tracking-tight">
                    {config.formatValue(metric.current)}
                  </span>
                  <span className="text-metal-400 text-xs">{config.unit}</span>
                </div>
              </div>

              <div className="space-y-1">
                <ChangeIndicator value={wowChange} lowerIsBetter={config.lowerIsBetter} label="环比" />
                <ChangeIndicator value={yoyChange} lowerIsBetter={config.lowerIsBetter} label="同比" />
              </div>

              <Sparkline
                data={sparklineData}
                color={sparklineColors[config.key]}
                lowerIsBetter={config.lowerIsBetter}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
