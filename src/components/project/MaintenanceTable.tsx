import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  Wrench, Search, SortAsc, SortDesc, SortAsc as SortIcon
} from 'lucide-react';
import type { MaintenanceRecord } from '@/types';
import { cn } from '@/lib/utils';

interface MaintenanceTableProps {
  records: MaintenanceRecord[];
}

type SortKey = 'startedAt' | 'type' | 'technician' | 'cost' | 'duration';
type SortOrder = 'asc' | 'desc';

interface Column {
  key: SortKey | 'description' | 'partsReplaced';
  label: string;
  sortable?: boolean;
  width?: string;
}

const columns: Column[] = [
  { key: 'startedAt', label: '日期', sortable: true, width: 'w-32' },
  { key: 'type', label: '类型', sortable: true, width: 'w-28' },
  { key: 'technician', label: '技术人员', sortable: true, width: 'w-28' },
  { key: 'description', label: '描述' },
  { key: 'partsReplaced', label: '更换配件', width: 'w-48' },
  { key: 'cost', label: '费用', sortable: true, width: 'w-28' },
  { key: 'duration', label: '时长', sortable: true, width: 'w-24' },
];

const getDuration = (record: MaintenanceRecord) => {
  const start = dayjs(record.startedAt);
  const end = dayjs(record.completedAt);
  return end.diff(start, 'minute');
};

export default function MaintenanceTable({ records }: MaintenanceTableProps) {
  const [searchType, setSearchType] = useState('');
  const [searchTechnician, setSearchTechnician] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('startedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchType = searchType
        ? r.type.toLowerCase().includes(searchType.toLowerCase())
        : true;
      const matchTech = searchTechnician
        ? r.technician.toLowerCase().includes(searchTechnician.toLowerCase())
        : true;
      return matchType && matchTech;
    });
  }, [records, searchType, searchTechnician]);

  const sortedRecords = useMemo(() => {
    const sorted = [...filteredRecords].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'startedAt':
          cmp = dayjs(a.startedAt).valueOf() - dayjs(b.startedAt).valueOf();
          break;
        case 'type':
          cmp = a.type.localeCompare(b.type, 'zh-CN');
          break;
        case 'technician':
          cmp = a.technician.localeCompare(b.technician, 'zh-CN');
          break;
        case 'cost':
          cmp = a.cost - b.cost;
          break;
        case 'duration':
          cmp = getDuration(a) - getDuration(b);
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [filteredRecords, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const SortIndicator = ({ colKey }: { colKey: SortKey }) => {
    if (sortKey !== colKey) return <SortIcon className="w-3.5 h-3.5 opacity-40" />;
    return sortOrder === 'asc'
      ? <SortAsc className="w-3.5 h-3.5 text-accent-teal" />
      : <SortDesc className="w-3.5 h-3.5 text-accent-teal" />;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}小时${m}分` : `${h}小时`;
  };

  return (
    <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent-purple/20">
            <Wrench className="w-4 h-4 text-accent-purple" />
          </div>
          <h3 className="text-white font-semibold text-base">维修记录台账</h3>
          <span className="text-xs text-metal-500 bg-navy-900/50 px-2.5 py-1 rounded-full border border-navy-700/40">
            共 {sortedRecords.length} 条
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-metal-500" />
            <input
              type="text"
              placeholder="搜索类型"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="bg-navy-900/60 border border-navy-700/50 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-metal-500 focus:outline-none focus:border-accent-teal/50 w-32"
            />
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-metal-500" />
            <input
              type="text"
              placeholder="搜索人员"
              value={searchTechnician}
              onChange={(e) => setSearchTechnician(e.target.value)}
              className="bg-navy-900/60 border border-navy-700/50 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-metal-500 focus:outline-none focus:border-accent-teal/50 w-32"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-navy-700/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy-900/60">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left font-medium text-metal-300 text-xs uppercase tracking-wider whitespace-nowrap',
                    col.width,
                    col.sortable && 'cursor-pointer hover:text-white select-none'
                  )}
                  onClick={() => col.sortable && handleSort(col.key as SortKey)}
                >
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && <SortIndicator colKey={col.key as SortKey} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700/30">
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-metal-500">
                  暂无维修记录
                </td>
              </tr>
            ) : (
              sortedRecords.map(record => (
                <tr key={record.id} className="hover:bg-navy-700/20 transition-colors">
                  <td className="px-4 py-3 text-metal-300 whitespace-nowrap font-mono text-xs">
                    {dayjs(record.startedAt).format('YYYY-MM-DD HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      record.type === '故障维修'
                        ? 'bg-accent-orange/15 text-accent-orange'
                        : 'bg-accent-teal/15 text-accent-teal'
                    )}>
                      {record.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white whitespace-nowrap">{record.technician}</td>
                  <td className="px-4 py-3 text-metal-300 max-w-xs">
                    <p className="truncate" title={record.description}>{record.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {record.partsReplaced.length === 0 ? (
                        <span className="text-metal-500 text-xs">-</span>
                      ) : (
                        record.partsReplaced.map((p, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-navy-700/50 text-metal-300 text-xs"
                          >
                            {p}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-accent-gold whitespace-nowrap font-mono">
                    ¥{record.cost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-metal-300 whitespace-nowrap">
                    {formatDuration(getDuration(record))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
