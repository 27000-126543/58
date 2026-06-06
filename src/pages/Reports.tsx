import { useState } from 'react';
import dayjs from 'dayjs';
import { FileText } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import ReportSelector from '@/components/reports/ReportSelector';
import MetricsComparison from '@/components/reports/MetricsComparison';
import TrendChart from '@/components/reports/TrendChart';
import RecommendationBox from '@/components/reports/RecommendationBox';

export default function Reports() {
  const { weeklyReports } = useAppStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentReport = weeklyReports[selectedIndex];

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
        {currentReport && (
          <div className="flex items-center gap-2 text-xs text-metal-400">
            <span>报告生成时间:</span>
            <span className="text-metal-200 font-medium">
              {dayjs(currentReport.generatedAt).format('YYYY年M月D日 HH:mm')}
            </span>
          </div>
        )}
      </div>

      <section>
        <ReportSelector
          reports={weeklyReports}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
      </section>

      <section>
        <MetricsComparison reports={weeklyReports} selectedIndex={selectedIndex} />
      </section>

      <section>
        <TrendChart reports={weeklyReports} />
      </section>

      <section>
        {currentReport && (
          <RecommendationBox recommendations={currentReport.recommendations} />
        )}
      </section>
    </div>
  );
}
