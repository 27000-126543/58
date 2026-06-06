import MetricCardGroup from '@/components/dashboard/MetricCardGroup';
import ZoneHeatMap from '@/components/dashboard/ZoneHeatMap';
import RideRanking from '@/components/dashboard/RideRanking';
import RealtimeAlertList from '@/components/dashboard/RealtimeAlertList';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white">核心看板</h1>
        <p className="text-metal-400 mt-1">实时掌握园区运营关键指标</p>
      </div>

      {/* 顶部指标卡 */}
      <section>
        <MetricCardGroup />
      </section>

      {/* 中间：热力图 + 排名 */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ZoneHeatMap />
        </div>
        <div className="lg:col-span-2">
          <RideRanking />
        </div>
      </section>

      {/* 底部预警列表 */}
      <section>
        <RealtimeAlertList />
      </section>
    </div>
  );
}
