import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, PlayCircle, Activity, Smile,
  Gauge, AlertTriangle, Wrench, CheckCircle
} from 'lucide-react';
import type { Ride } from '@shared/types';
import { cn } from '@/lib/utils';

interface ProjectInfoHeaderProps {
  ride: Ride;
}

const statusConfig = {
  normal: {
    label: '正常运行',
    icon: CheckCircle,
    bg: 'bg-accent-teal/15',
    text: 'text-accent-teal',
    border: 'border-accent-teal/30',
  },
  warning: {
    label: '预警中',
    icon: AlertTriangle,
    bg: 'bg-accent-orange/15',
    text: 'text-accent-orange',
    border: 'border-accent-orange/30',
  },
  maintenance: {
    label: '维护中',
    icon: Wrench,
    bg: 'bg-accent-purple/15',
    text: 'text-accent-purple',
    border: 'border-accent-purple/30',
  },
};

const metrics = [
  { key: 'waitTime', label: '当前等待时间', unit: '分钟', icon: Clock, color: 'accent-orange' },
  { key: 'todayRides', label: '今日运行次数', unit: '次', icon: PlayCircle, color: 'accent-teal' },
  { key: 'availability', label: '设备可用率', unit: '%', icon: Activity, color: 'accent-purple' },
  { key: 'satisfaction', label: '游客满意度', unit: '分', icon: Smile, color: 'accent-gold' },
];

export default function ProjectInfoHeader({ ride }: ProjectInfoHeaderProps) {
  const navigate = useNavigate();
  const status = statusConfig[ride.status];
  const StatusIcon = status.icon;
  const vibrationWarn = ride.vibrationLevel >= ride.vibrationThreshold;

  const getMetricValue = (key: string) => {
    switch (key) {
      case 'waitTime': return ride.currentWaitTime;
      case 'todayRides': return ride.todayRides;
      case 'availability': return ride.availability.toFixed(1);
      case 'satisfaction': return ride.satisfaction.toFixed(1);
      default: return 0;
    }
  };

  return (
    <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-6">
      <div className="flex items-start justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-metal-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>

        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border',
          status.bg, status.border
        )}>
          <StatusIcon className={cn('w-4 h-4', status.text)} />
          <span className={cn('text-sm font-medium', status.text)}>{status.label}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-navy-700/60 border border-navy-600/50 flex items-center justify-center text-5xl">
            {ride.icon}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">{ride.name}</h1>
            <p className="text-metal-400 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-navy-400" />
              {ride.zoneName}
            </p>
          </div>
        </div>

        <div className="lg:ml-auto flex items-center gap-3 bg-navy-900/50 px-4 py-3 rounded-xl border border-navy-700/40">
          <Gauge className={cn('w-5 h-5', vibrationWarn ? 'text-accent-red' : 'text-accent-teal')} />
          <div>
            <p className="text-xs text-metal-500">振动值</p>
            <p className={cn('font-mono text-lg font-bold', vibrationWarn ? 'text-accent-red' : 'text-white')}>
              {ride.vibrationLevel}
              <span className="text-metal-400 text-sm font-normal ml-1">mm/s</span>
              <span className="text-metal-500 text-xs font-normal ml-2">/ 阈值 {ride.vibrationThreshold}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const value = getMetricValue(metric.key);
          return (
            <div
              key={metric.key}
              className="bg-navy-900/40 rounded-xl p-4 border border-navy-700/30 hover:border-navy-600/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn('w-4 h-4', `text-${metric.color}`)} />
                <span className="text-metal-400 text-sm">{metric.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-bold text-white">{value}</span>
                <span className="text-metal-500 text-sm">{metric.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
