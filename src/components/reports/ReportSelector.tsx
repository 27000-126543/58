import { useState } from 'react';
import dayjs from 'dayjs';
import { Download, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeeklyReport } from '@/types';

interface ReportSelectorProps {
  reports: WeeklyReport[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function ReportSelector({ reports, selectedIndex, onSelect }: ReportSelectorProps) {
  const [showToast, setShowToast] = useState(false);

  const handleExport = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {reports.map((report, index) => {
            const start = dayjs(report.weekStart);
            const end = dayjs(report.weekEnd);
            const isSelected = index === selectedIndex;
            return (
              <button
                key={report.id}
                onClick={() => onSelect(index)}
                className={cn(
                  'relative px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap',
                  isSelected
                    ? 'bg-navy-600/80 text-white shadow-lg shadow-navy-900/40'
                    : 'bg-navy-800/40 text-metal-300 hover:bg-navy-700/60 hover:text-white'
                )}
              >
                <div className="flex items-center gap-2">
                  <span>第 {reports.length - index} 周</span>
                  <span className={cn('text-xs', isSelected ? 'text-accent-teal' : 'text-metal-500')}>
                    {start.format('M/D')} - {end.format('M/D')}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent-teal rounded-full shadow-glow-teal" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-accent-teal to-accent-teal/80 text-navy-900 font-semibold text-sm hover:from-accent-teal/90 hover:to-accent-teal/70 transition-all duration-300 shadow-glow-teal"
        >
          <Download className="w-4 h-4" />
          导出报告
        </button>
      </div>

      {showToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-navy-700/95 backdrop-blur-md border border-accent-teal/30 text-white shadow-2xl animate-fade-in-up">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent-teal/20">
            <Check className="w-4 h-4 text-accent-teal" />
          </div>
          <span className="text-sm font-medium">报告已生成并下载</span>
        </div>
      )}
    </div>
  );
}
