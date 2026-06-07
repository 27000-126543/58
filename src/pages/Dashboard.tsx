import { useEffect, useState } from 'react';
import MetricCardGroup from '@/components/dashboard/MetricCardGroup';
import ZoneHeatMap from '@/components/dashboard/ZoneHeatMap';
import RideRanking from '@/components/dashboard/RideRanking';
import RealtimeAlertList from '@/components/dashboard/RealtimeAlertList';
import { useAppStore } from '@/store/appStore';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-40 bg-metal-700/40 rounded animate-pulse" />
        <div className="h-4 w-60 bg-metal-700/30 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-navy-700/50 bg-navy-800/40 backdrop-blur-sm"
          >
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
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 h-[340px] rounded-2xl border border-navy-700/50 bg-navy-800/40 animate-pulse" />
        <div className="lg:col-span-2 h-[340px] rounded-2xl border border-navy-700/50 bg-navy-800/40 animate-pulse" />
      </div>

      <div className="h-[340px] rounded-2xl border border-navy-700/50 bg-navy-800/40 animate-pulse" />
    </div>
  );
}

export default function Dashboard() {
  const zones = useAppStore((s) => s.zones);
  const fetchDashboard = useAppStore((s) => s.fetchDashboard);
  const [loading, setLoading] = useState(zones.length === 0);

  useEffect(() => {
    if (zones.length === 0) {
      setLoading(true);
      fetchDashboard().finally(() => setLoading(false));
    }
  }, [zones.length, fetchDashboard]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">核心看板</h1>
        <p className="text-metal-400 mt-1">实时掌握园区运营关键指标</p>
      </div>

      <section>
        <MetricCardGroup />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ZoneHeatMap />
        </div>
        <div className="lg:col-span-2">
          <RideRanking />
        </div>
      </section>

      <section>
        <RealtimeAlertList />
      </section>
    </div>
  );
}
