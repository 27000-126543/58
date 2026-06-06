import { useAppStore } from '@/store/appStore';
import MetricCard from './MetricCard';

export default function MetricCardGroup() {
  const globalMetrics = useAppStore(state => state.globalMetrics);

  // 计算同比变化率
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
