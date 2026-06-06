import { useParams } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import ProjectInfoHeader from '@/components/project/ProjectInfoHeader';
import QueueTrendChart from '@/components/project/QueueTrendChart';
import FaultTimeline from '@/components/project/FaultTimeline';
import MaintenanceTable from '@/components/project/MaintenanceTable';
import { AlertTriangle } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();

  const ride = useAppStore(state => state.rides.find(r => r.id === id));
  const queueRecords = useAppStore(state => state.queueRecords[id!] || []);
  const equipmentFaults = useAppStore(state =>
    state.equipmentFaults.filter(f => f.rideId === id)
  );
  const maintenanceRecords = useAppStore(state =>
    state.maintenanceRecords.filter(m => m.rideId === id)
  );

  if (!ride) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-navy-800/60 border border-navy-700/50 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-accent-orange" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">项目未找到</h2>
        <p className="text-metal-400 mb-6">
          未找到 ID 为 <code className="bg-navy-800 px-2 py-1 rounded text-accent-teal">{id}</code> 的游乐项目
        </p>
        <div className="bg-navy-800/60 backdrop-blur-xl rounded-xl border border-navy-600/50 p-8 text-center max-w-md">
          <p className="text-metal-400">请检查链接是否正确，或返回仪表盘查看所有项目。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectInfoHeader ride={ride} />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <QueueTrendChart queueRecords={queueRecords} />
        </div>
        <div className="xl:col-span-2">
          <FaultTimeline faults={equipmentFaults} />
        </div>
      </div>

      <MaintenanceTable records={maintenanceRecords} />
    </div>
  );
}
