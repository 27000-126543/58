import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { BarChart3, Users, Clock } from 'lucide-react';
import type { WeeklyReport } from '@shared/types';

interface TooltipParam {
  axisValue: string;
  seriesName: string;
  seriesType: string;
  color: string;
  value: number;
}

interface LabelParam {
  value: number;
}

interface TrendChartProps {
  reports: WeeklyReport[];
}

export default function TrendChart({ reports }: TrendChartProps) {
  const chartOption = useMemo(() => {
    const sortedReports = [...reports].reverse();
    const weekLabels = sortedReports.map((r) => {
      const start = dayjs(r.weekStart);
      const end = dayjs(r.weekEnd);
      return `${start.format('M/D')}-${end.format('M/D')}`;
    });
    const visitorData = sortedReports.map((r) => r.totalVisitors.current);
    const waitTimeData = sortedReports.map((r) => r.avgWaitTime.current);

    const totalVisitors = visitorData.reduce((a, b) => a + b, 0);
    const avgWaitTime = Math.round(
      waitTimeData.reduce((a, b) => a + b, 0) / waitTimeData.length
    );
    const maxVisitors = Math.max(...visitorData);

    return {
      option: {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(10, 26, 51, 0.95)',
          borderColor: 'rgba(49, 108, 192, 0.5)',
          borderWidth: 1,
          textStyle: { color: '#fff', fontSize: 12 },
          axisPointer: {
            type: 'cross',
            lineStyle: { color: 'rgba(0, 212, 170, 0.5)' },
            crossStyle: { color: 'rgba(0, 212, 170, 0.5)' },
          },
          formatter: (params: TooltipParam[]) => {
            const time = params[0].axisValue;
            let html = `<div class="font-semibold mb-2">${time}</div>`;
            params.forEach((p: TooltipParam) => {
              const unit = p.seriesName.includes('客流') ? ' 人次' : ' 分钟';
              html += `<div class="flex items-center gap-2 text-xs">
                <span style="display:inline-block;width:8px;height:8px;border-radius:${p.seriesType === 'bar' ? '2px' : '50%'};background:${p.color}"></span>
                <span>${p.seriesName}:</span>
                <span class="font-mono font-semibold">${Number(p.value).toLocaleString()}${unit}</span>
              </div>`;
            });
            return html;
          },
        },
        legend: {
          data: ['周客流总量', '平均等待时间'],
          top: 0,
          right: 0,
          textStyle: { color: '#9BADCC', fontSize: 12 },
          itemWidth: 16,
          itemHeight: 10,
          icon: 'roundRect',
        },
        grid: {
          left: '3%',
          right: '4%',
          top: 50,
          bottom: 40,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: weekLabels,
          axisLine: { lineStyle: { color: 'rgba(155, 173, 204, 0.2)' } },
          axisLabel: {
            color: '#7A8BA3',
            fontSize: 11,
          },
          axisTick: { show: false },
        },
        yAxis: [
          {
            type: 'value',
            name: '客流(人次)',
            nameTextStyle: { color: '#7A8BA3', fontSize: 11, padding: [0, 0, 0, -10] },
            position: 'left',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: '#7A8BA3',
              fontSize: 11,
              formatter: (v: number) => (v >= 10000 ? (v / 10000).toFixed(1) + '万' : v.toLocaleString()),
            },
            splitLine: { lineStyle: { color: 'rgba(155, 173, 204, 0.1)', type: 'dashed' } },
          },
          {
            type: 'value',
            name: '等待时间(分钟)',
            nameTextStyle: { color: '#7A8BA3', fontSize: 11, padding: [0, -10, 0, 0] },
            position: 'right',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: '#7A8BA3',
              fontSize: 11,
              formatter: (v: number) => v + '分',
            },
            splitLine: { show: false },
          },
        ],
        series: [
          {
            name: '周客流总量',
            type: 'bar',
            yAxisIndex: 0,
            data: visitorData,
            barWidth: '40%',
            itemStyle: {
              borderRadius: [6, 6, 0, 0],
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 212, 170, 0.9)' },
                  { offset: 1, color: 'rgba(0, 212, 170, 0.3)' },
                ],
              },
            },
            emphasis: {
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(0, 212, 170, 1)' },
                    { offset: 1, color: 'rgba(0, 212, 170, 0.5)' },
                  ],
                },
              },
            },
            label: {
              show: true,
              position: 'top',
              color: '#00D4AA',
              fontSize: 11,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              formatter: (p: LabelParam) => (p.value / 10000).toFixed(1) + '万',
            },
          },
          {
            name: '平均等待时间',
            type: 'line',
            yAxisIndex: 1,
            data: waitTimeData,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              color: '#FF6B35',
              width: 3,
              shadowColor: 'rgba(255, 107, 53, 0.4)',
              shadowBlur: 10,
            },
            itemStyle: {
              color: '#FF6B35',
              borderColor: '#0A1A33',
              borderWidth: 2,
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(255, 107, 53, 0.25)' },
                  { offset: 1, color: 'rgba(255, 107, 53, 0)' },
                ],
              },
            },
            label: {
              show: true,
              position: 'top',
              color: '#FF6B35',
              fontSize: 11,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              formatter: (p: LabelParam) => p.value + '分',
            },
          },
        ],
      },
      summary: { totalVisitors, avgWaitTime, maxVisitors },
    };
  }, [reports]);

  return (
    <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-accent-teal/20">
          <BarChart3 className="w-5 h-5 text-accent-teal" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-base">周度趋势对比</h3>
          <p className="text-metal-400 text-xs">近4周客流与等待时间分析</p>
        </div>
      </div>

      <ReactECharts
        option={chartOption.option}
        style={{ height: 340, width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />

      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-navy-700/50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-accent-teal mb-1">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">4周总客流</span>
          </div>
          <p className="text-white font-mono text-xl font-bold">
            {(chartOption.summary.totalVisitors / 10000).toFixed(1)}
          </p>
          <p className="text-metal-500 text-xs">万人次</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-accent-orange mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">平均等待</span>
          </div>
          <p className="text-white font-mono text-xl font-bold">
            {chartOption.summary.avgWaitTime}
          </p>
          <p className="text-metal-500 text-xs">分钟</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-accent-purple mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">单周最高</span>
          </div>
          <p className="text-white font-mono text-xl font-bold">
            {(chartOption.summary.maxVisitors / 10000).toFixed(1)}
          </p>
          <p className="text-metal-500 text-xs">万人次</p>
        </div>
      </div>
    </div>
  );
}
