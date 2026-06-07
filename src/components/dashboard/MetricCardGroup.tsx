import { useAppStore } from '@/store/appStore';
import MetricCard from './MetricCard';

function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl border border-navy-700/50 bg-navy-800/40 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-metal-700/40 animate-pulse" />
        <div className="h-6 w-16 rounded-lg bg-metal-700/40 animate-pulse" />
      </div>
      <div className="h-9 w-32 bg-metal-700/40 rounded animate-pulse mb-2" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-metal-700/30 rounded animate-pulse" />
        <div className="h-3 w-16 bg-metal-700/20 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function MetricCardGroup() {
  const globalMetrics = useAppStore((state) => state.globalMetrics);

  if (!globalMetrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const calcChange = (current: number, yesterday: number) => {
    if (yesterday === 0) return 0;
    return ((current - yesterday) / yesterday) * 100;
  };

  const metrics = [
    {
      type: 'visitors' as const,
      title: '今日游客人数',
      value: globalMetrics.totalVisitors.toLocaleString(),
      unit: '人次',
      change: calcChange(globalMetrics.totalVisitors, globalMetrics.totalVisitorsYesterday),
    },
    {
      type: 'waitTime' as const,
      title: '平均等待时间',
      value: globalMetrics.avgWaitTime,
      unit: '分钟',
      change: calcChange(globalMetrics.avgWaitTime, globalMetrics.avgWaitTimeYesterday),
    },
    {
      type: 'availability' as const,
      title: '设备可用率',
      value: globalMetrics.equipmentAvailability.toFixed(1),
      unit: '%',
      change: calcChange(globalMetrics.equipmentAvailability, globalMetrics.equipmentAvailabilityYesterday),
    },
    {
      type: 'turnover' as const,
      title: '餐饮翻台率',
      value: globalMetrics.restaurantTurnover.toFixed(1),
      unit: '次',
      change: calcChange(globalMetrics.restaurantTurnover, globalMetrics.restaurantTurnoverYesterday),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => (
        <div key={m.type} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
          <MetricCard
            type={m.type}
            title={m.title}
            value={m.value}
            unit={m.unit}
            change={m.change}
          />
        </div>
      ))}
    </div>
  );
}
