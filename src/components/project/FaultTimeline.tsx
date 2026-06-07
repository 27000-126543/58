import dayjs from 'dayjs';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RideFault {
  id: string;
  timestamp: string;
  overallLevel: number;
  threshold: number;
  xAxis: number;
  yAxis: number;
  zAxis: number;
  severity: 'warning' | 'critical';
}

interface FaultTimelineProps {
  faults: RideFault[];
}

const severityConfig: Record<RideFault['severity'], {
  label: string;
  bg: string;
  text: string;
  dot: string;
  border: string;
}> = {
  warning: {
    label: '警告',
    bg: 'bg-accent-gold/15',
    text: 'text-accent-gold',
    dot: 'bg-accent-gold',
    border: 'border-accent-gold/50',
  },
  critical: {
    label: '严重',
    bg: 'bg-accent-red/15',
    text: 'text-accent-red',
    dot: 'bg-accent-red',
    border: 'border-accent-red/50',
  },
};

export default function FaultTimeline({ faults }: FaultTimelineProps) {
  const sortedFaults = [...faults].sort(
    (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()
  );

  return (
    <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent-red/20">
            <AlertCircle className="w-4 h-4 text-accent-red" />
          </div>
          <h3 className="text-white font-semibold text-base">设备异常记录</h3>
        </div>
        <span className="text-xs text-metal-500 bg-navy-900/50 px-2.5 py-1 rounded-full border border-navy-700/40">
          共 {faults.length} 条
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-0.5">
        {sortedFaults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-metal-500">
            <CheckCircle2 className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">暂无异常记录</p>
          </div>
        ) : (
          sortedFaults.map((fault, index) => {
            const severity = severityConfig[fault.severity];
            const isLast = index === sortedFaults.length - 1;

            return (
              <div key={fault.id} className="relative flex gap-4 pb-5">
                <div className="flex flex-col items-center shrink-0">
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center border-2 z-10 bg-navy-800',
                    severity.border
                  )}>
                    <div className={cn('w-3 h-3 rounded-full', severity.dot)} />
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 bg-navy-600/40 mt-1" />
                  )}
                </div>

                <div className="flex-1 pb-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-white font-medium text-sm">振动值异常</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      severity.bg, severity.text
                    )}>
                      {severity.label}
                    </span>
                  </div>

                  <p className="text-metal-300 text-sm mb-1.5 leading-relaxed">
                    振动值 <span className="text-white font-mono">{fault.overallLevel} mm/s</span>
                    ，超过阈值 <span className="text-accent-orange font-mono">{fault.threshold} mm/s</span>
                    （X:{fault.xAxis.toFixed(2)} Y:{fault.yAxis.toFixed(2)} Z:{fault.zAxis.toFixed(2)}）
                  </p>

                  <div className="flex items-center gap-3 text-xs text-metal-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{dayjs(fault.timestamp).format('MM-DD HH:mm:ss')}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
