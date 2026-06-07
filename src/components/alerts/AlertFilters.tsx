import { Filter, AlertTriangle, Users, Activity, Clock, ShieldCheck, TrendingUp, CheckCircle, MapPin } from 'lucide-react';
import type { AlertLevel, AlertType, AlertStatus } from '@shared/types';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

export interface AlertFilterValues {
  level: AlertLevel | 'all';
  type: AlertType | 'all';
  status: AlertStatus | 'all';
  zoneId: string | 'all';
}

interface AlertFiltersProps {
  filters: AlertFilterValues;
  onChange: (filters: AlertFilterValues) => void;
}

interface FilterTab<T> {
  value: T | 'all';
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badgeClass?: string;
}

const levelTabs: FilterTab<AlertLevel>[] = [
  { value: 'all', label: '全部等级' },
  { value: 1, label: '一级预警', icon: AlertTriangle, badgeClass: 'bg-orange-100 text-orange-600' },
  { value: 2, label: '二级预警', icon: AlertTriangle, badgeClass: 'bg-red-100 text-red-600' },
];

const typeTabs: FilterTab<AlertType>[] = [
  { value: 'all', label: '全部类型' },
  { value: 'queue', label: '排队预警', icon: Users },
  { value: 'vibration', label: '振动预警', icon: Activity },
];

const statusTabs: FilterTab<AlertStatus>[] = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '待处理', icon: Clock, badgeClass: 'bg-amber-100 text-amber-600' },
  { value: 'processing', label: '处理中', icon: ShieldCheck, badgeClass: 'bg-blue-100 text-blue-600' },
  { value: 'escalated', label: '已升级', icon: TrendingUp, badgeClass: 'bg-purple-100 text-purple-600' },
  { value: 'resolved', label: '已解除', icon: CheckCircle, badgeClass: 'bg-green-100 text-green-600' },
];

function FilterGroup<T extends string | number>({
  tabs,
  value,
  onChange,
}: {
  tabs: FilterTab<T>[];
  value: T | 'all';
  onChange: (v: T | 'all') => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = value === tab.value;
        return (
          <button
            key={String(tab.value)}
            onClick={() => onChange(tab.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
              isActive
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function AlertFilters({ filters, onChange }: AlertFiltersProps) {
  const { zones } = useAppStore();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">筛选条件</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-16 shrink-0">预警等级</span>
          <FilterGroup
            tabs={levelTabs}
            value={filters.level}
            onChange={(v) => onChange({ ...filters, level: v as AlertLevel | 'all' })}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-16 shrink-0">预警类型</span>
          <FilterGroup
            tabs={typeTabs}
            value={filters.type}
            onChange={(v) => onChange({ ...filters, type: v as AlertType | 'all' })}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-16 shrink-0">预警状态</span>
          <FilterGroup
            tabs={statusTabs}
            value={filters.status}
            onChange={(v) => onChange({ ...filters, status: v as AlertStatus | 'all' })}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-16 shrink-0">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              区域
            </span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onChange({ ...filters, zoneId: 'all' })}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
                filters.zoneId === 'all'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              )}
            >
              全部区域
            </button>
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => onChange({ ...filters, zoneId: zone.id })}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
                  filters.zoneId === zone.id
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                )}
                style={filters.zoneId === zone.id ? { backgroundColor: zone.color } : undefined}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: zone.color }}
                />
                {zone.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
