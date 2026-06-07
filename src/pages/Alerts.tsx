import { useState, useMemo, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import AlertCard from '@/components/alerts/AlertCard';
import AlertFilters, { type AlertFilterValues } from '@/components/alerts/AlertFilters';
import ApprovalFlowModal from '@/components/alerts/ApprovalFlowModal';
import EscalateModal from '@/components/alerts/EscalateModal';
import Empty from '@/components/Empty';
import { useAppStore } from '@/store/appStore';
import type { Alert } from '@shared/types';
import { cn } from '@/lib/utils';

interface StatCard {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
  textClass: string;
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="relative overflow-hidden bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 animate-pulse" />
              <div className="flex h-2 w-2 rounded-full bg-gray-200 animate-pulse" />
            </div>
            <div className="text-2xl font-bold h-7 w-12 bg-gray-200 rounded animate-pulse mb-0.5" />
            <div className="text-xs h-3 w-16 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-56 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse" />
      ))}
    </div>
  );
}

export default function Alerts() {
  const { alerts, user, filterByPermission, fetchAlerts } = useAppStore();
  const [filters, setFilters] = useState<AlertFilterValues>({
    level: 'all',
    type: 'all',
    status: 'all',
    zoneId: 'all',
  });
  const [escalateAlert, setEscalateAlert] = useState<Alert | null>(null);
  const [approvalAlert, setApprovalAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchAlerts().finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [fetchAlerts]);

  const visibleAlerts = useMemo(() => filterByPermission(alerts), [alerts, filterByPermission]);

  const stats: StatCard[] = useMemo(() => {
    const total = visibleAlerts.length;
    const level1 = visibleAlerts.filter((a) => a.level === 1).length;
    const level2 = visibleAlerts.filter((a) => a.level === 2).length;
    const resolved = visibleAlerts.filter((a) => a.status === 'resolved').length;
    return [
      {
        label: '预警总数',
        value: total,
        icon: Bell,
        gradient: 'from-blue-500 to-indigo-600',
        iconBg: 'bg-blue-100',
        textClass: 'text-blue-600',
      },
      {
        label: '一级预警',
        value: level1,
        icon: AlertTriangle,
        gradient: 'from-orange-500 to-amber-600',
        iconBg: 'bg-orange-100',
        textClass: 'text-orange-600',
      },
      {
        label: '二级预警',
        value: level2,
        icon: AlertCircle,
        gradient: 'from-red-500 to-rose-600',
        iconBg: 'bg-red-100',
        textClass: 'text-red-600',
      },
      {
        label: '已处理',
        value: resolved,
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-green-600',
        iconBg: 'bg-emerald-100',
        textClass: 'text-emerald-600',
      },
    ];
  }, [visibleAlerts]);

  const filteredAlerts = useMemo(() => {
    return visibleAlerts.filter((alert) => {
      if (filters.level !== 'all' && alert.level !== filters.level) return false;
      if (filters.type !== 'all' && alert.type !== filters.type) return false;
      if (filters.status !== 'all' && alert.status !== filters.status) return false;
      if (filters.zoneId !== 'all' && alert.zoneId !== filters.zoneId) return false;
      return true;
    });
  }, [visibleAlerts, filters]);

  const sortedAlerts = useMemo(() => {
    return [...filteredAlerts].sort((a, b) => {
      const priority = { escalated: 0, active: 1, processing: 2, resolved: 3 } as const;
      if (priority[a.status] !== priority[b.status]) return priority[a.status] - priority[b.status];
      if (a.level !== b.level) return b.level - a.level;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredAlerts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-200">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">预警管理中心</h1>
              <p className="text-sm text-gray-500">实时监控园区游乐设备运行和游客排队情况</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 ml-[52px]">
              <span>当前登录：</span>
              <span className="font-medium text-gray-700">{user.name}</span>
              <span className="text-gray-300">·</span>
              <span>{user.roleName}</span>
            </div>
          )}
        </div>

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="relative overflow-hidden bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className={cn('absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br', stat.gradient)} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', stat.iconBg)}>
                        <Icon className={cn('h-4 w-4', stat.textClass)} />
                      </div>
                      <div className="flex h-2 w-2 rounded-full bg-gray-200">
                        <span className={cn('flex-1 rounded-full bg-gradient-to-r', stat.gradient)} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mb-6">
          <AlertFilters filters={filters} onChange={setFilters} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-700">
              预警列表
              <span className="ml-2 text-gray-400 font-normal">共 {sortedAlerts.length} 条</span>
            </h2>
          </div>

          {loading ? (
            <AlertsGridSkeleton />
          ) : sortedAlerts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16">
              <Empty />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onEscalate={() => setEscalateAlert(alert)}
                  onViewApproval={() => setApprovalAlert(alert)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {escalateAlert && (
        <EscalateModal
          alert={escalateAlert}
          onClose={() => setEscalateAlert(null)}
          onSuccess={() => setEscalateAlert(null)}
        />
      )}

      {approvalAlert && (
        <ApprovalFlowModal
          alert={approvalAlert}
          onClose={() => setApprovalAlert(null)}
        />
      )}
    </div>
  );
}
