import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  Wrench, Search, SortAsc, SortDesc, SortAsc as SortIcon, CheckCircle2, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RideMaintenance {
  id: string;
  alertId: string;
  timestamp: string;
  resolvedAt?: string;
  type: 'queue' | 'vibration';
  message: string;
  handledBy?: string;
}

interface MaintenanceTableProps {
  records: RideMaintenance[];
}

type SortKey = 'timestamp' | 'type' | 'handledBy';
type SortOrder = 'asc' | 'desc';

interface Column {
  key: SortKey | 'message' | 'status';
  label: string;
  sortable?: boolean;
  width?: string;
}

const columns: Column[] = [
  { key: 'timestamp', label: '时间', sortable: true, width: 'w-40' },
  { key: 'type', label: '类型', sortable: true, width: 'w-28' },
  { key: 'handledBy', label: '处理人', sortable: true, width: 'w-28' },
  { key: 'message', label: '描述' },
  { key: 'status', label: '状态', width: 'w-28' },
];

export default function MaintenanceTable({ records }: MaintenanceTableProps) {
  const [searchType, setSearchType] = useState('');
  const [searchHandler, setSearchHandler] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchType = searchType
        ? r.type.toLowerCase().includes(searchType.toLowerCase())
        : true;
      const matchHandler = searchHandler && r.handledBy
        ? r.handledBy.toLowerCase().includes(searchHandler.toLowerCase())
        : true;
      return matchType && matchHandler;
    });
  }, [records, searchType, searchHandler]);

  const sortedRecords = useMemo(() => {
    const sorted = [...filteredRecords].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'timestamp':
          cmp = dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf();
          break;
        case 'type':
          cmp = a.type.localeCompare(b.type, 'zh-CN');
          break;
        case 'handledBy':
          cmp = (a.handledBy || '').localeCompare(b.handledBy || '', 'zh-CN');
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

  const typeLabel = (t: 'queue' | 'vibration') =>
    t === 'queue' ? '排队预警' : '振动预警';

  return (
    <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent-purple/20">
            <Wrench className="w-4 h-4 text-accent-purple" />
          </div>
          <h3 className="text-white font-semibold text-base">维护记录台账</h3>
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
              value={searchHandler}
              onChange={(e) => setSearchHandler(e.target.value)}
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
                  暂无维护记录
                </td>
              </tr>
            ) : (
              sortedRecords.map(record => {
                const isResolved = !!record.resolvedAt;
                return (
                  <tr key={record.id} className="hover:bg-navy-700/20 transition-colors">
                    <td className="px-4 py-3 text-metal-300 whitespace-nowrap font-mono text-xs">
                      {dayjs(record.timestamp).format('YYYY-MM-DD HH:mm')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        record.type === 'queue'
                          ? 'bg-accent-orange/15 text-accent-orange'
                          : 'bg-accent-red/15 text-accent-red'
                      )}>
                        {typeLabel(record.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white whitespace-nowrap">
                      {record.handledBy || <span className="text-metal-500">-</span>}
                    </td>
                    <td className="px-4 py-3 text-metal-300 max-w-md">
                      <p className="truncate" title={record.message}>{record.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                        isResolved
                          ? 'bg-accent-teal/15 text-accent-teal'
                          : 'bg-accent-orange/15 text-accent-orange'
                      )}>
                        {isResolved ? (
                          <><CheckCircle2 className="w-3 h-3" />已处理</>
                        ) : (
                          <><Clock className="w-3 h-3" />处理中</>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
