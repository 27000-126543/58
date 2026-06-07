import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { FileText, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import ReportSelector from '@/components/reports/ReportSelector';
import MetricsComparison from '@/components/reports/MetricsComparison';
import TrendChart from '@/components/reports/TrendChart';
import RecommendationBox from '@/components/reports/RecommendationBox';

export default function Reports() {
  const { reports, fetchReports, generate, user } = useAppStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [fetchReports, user]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [reports.length]);

  const currentReport = reports[selectedIndex];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generate();
    } finally {
      setGenerating(false);
    }
  };

  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent-teal/20 animate-pulse">
              <div className="w-6 h-6" />
            </div>
            <div>
              <div className="h-7 w-32 bg-navy-700/60 rounded animate-pulse" />
              <div className="h-4 w-48 bg-navy-700/60 rounded animate-pulse mt-2" />
            </div>
          </div>
        </div>

        <div className="h-16 bg-navy-800/60 border border-navy-700/50 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-44 bg-navy-800/60 border border-navy-700/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-navy-800/60 border border-navy-700/50 rounded-2xl animate-pulse" />
        <div className="h-80 bg-navy-800/60 border border-navy-700/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-teal/20">
            <FileText className="w-6 h-6 text-accent-teal" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">运营报告</h1>
            <p className="text-metal-400 mt-1 text-sm">查看园区运营周报和数据分析</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-teal/20 text-accent-teal font-medium text-sm hover:bg-accent-teal/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? '生成中...' : '生成报告'}
          </button>
          {currentReport && (
            <div className="flex items-center gap-2 text-xs text-metal-400">
              <span>报告生成时间:</span>
              <span className="text-metal-200 font-medium">
                {dayjs(currentReport.generatedAt).format('YYYY年M月D日 HH:mm')}
              </span>
            </div>
          )}
        </div>
      </div>

      <section>
        <ReportSelector
          reports={reports}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
      </section>

      <section>
        <MetricsComparison reports={reports} selectedIndex={selectedIndex} />
      </section>

      <section>
        <TrendChart reports={reports} />
      </section>

      <section>
        {currentReport && (
          <RecommendationBox recommendations={currentReport.recommendations} />
        )}
      </section>
    </div>
  );
}
