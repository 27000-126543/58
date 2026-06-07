import { useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import ProjectInfoHeader from '@/components/project/ProjectInfoHeader';
import QueueTrendChart from '@/components/project/QueueTrendChart';
import FaultTimeline, { type RideFault } from '@/components/project/FaultTimeline';
import MaintenanceTable, { type RideMaintenance } from '@/components/project/MaintenanceTable';
import VibrationChart from '@/components/project/VibrationChart';
import { AlertTriangle } from 'lucide-react';
import type { Ride, QueueRecord, VibrationReading } from '@shared/types';

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-navy-800/60 rounded-2xl border border-navy-700/50 p-6 animate-pulse">
        <div className="flex items-start justify-between mb-6">
          <div className="h-5 w-16 bg-metal-700/40 rounded" />
          <div className="h-8 w-28 bg-metal-700/40 rounded-lg" />
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-metal-700/40" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-metal-700/40 rounded" />
            <div className="h-4 w-32 bg-metal-700/30 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="bg-navy-900/40 rounded-xl p-4 h-20 border border-navy-700/30" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 h-[380px] bg-navy-800/60 rounded-2xl border border-navy-700/50 animate-pulse" />
        <div className="xl:col-span-2 h-[380px] bg-navy-800/60 rounded-2xl border border-navy-700/50 animate-pulse" />
      </div>

      <div className="h-[380px] bg-navy-800/60 rounded-2xl border border-navy-700/50 animate-pulse" />
      <div className="h-[380px] bg-navy-800/60 rounded-2xl border border-navy-700/50 animate-pulse" />
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();

  const rideReq = useFetch<Ride>(id ? `/rides/${id}` : null);
  const queueReq = useFetch<QueueRecord[]>(id ? `/rides/${id}/queue-records?days=7` : null);
  const vibrationReq = useFetch<VibrationReading[]>(id ? `/rides/${id}/vibration-readings?hours=24` : null);
  const faultsReq = useFetch<RideFault[]>(id ? `/rides/${id}/faults` : null);
  const maintenanceReq = useFetch<RideMaintenance[]>(id ? `/rides/${id}/maintenance` : null);

  const allLoading = rideReq.loading || queueReq.loading || vibrationReq.loading || faultsReq.loading || maintenanceReq.loading;
  const hasAnyError = rideReq.error || queueReq.error || vibrationReq.error || faultsReq.error || maintenanceReq.error;

  if (allLoading) {
    return <DetailSkeleton />;
  }

  if (!rideReq.data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-navy-800/60 border border-navy-700/50 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-accent-orange" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">项目未找到</h2>
        <p className="text-metal-400 mb-6">
          未找到 ID 为 <code className="bg-navy-800 px-2 py-1 rounded text-accent-teal">{id}</code> 的游乐项目
        </p>
        {hasAnyError && (
          <div className="bg-navy-800/60 backdrop-blur-xl rounded-xl border border-navy-600/50 p-4 text-center max-w-md text-sm text-metal-400">
            {rideReq.error || queueReq.error || vibrationReq.error || faultsReq.error || maintenanceReq.error}
          </div>
        )}
      </div>
    );
  }

  const ride = rideReq.data;
  const queueRecords = queueReq.data || [];
  const vibrationReadings = vibrationReq.data || [];
  const faults = faultsReq.data || [];
  const maintenanceRecords = maintenanceReq.data || [];

  return (
    <div className="space-y-6">
      <ProjectInfoHeader ride={ride} />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <QueueTrendChart queueRecords={queueRecords} />
        </div>
        <div className="xl:col-span-2">
          <FaultTimeline faults={faults} />
        </div>
      </div>

      <VibrationChart readings={vibrationReadings} threshold={ride.vibrationThreshold} />

      <MaintenanceTable records={maintenanceRecords} />
    </div>
  );
}
