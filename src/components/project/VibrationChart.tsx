import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { Activity } from 'lucide-react';
import type { VibrationReading } from '@shared/types';

interface VibrationChartProps {
  readings: VibrationReading[];
  threshold?: number;
}

export default function VibrationChart({ readings, threshold = 5.0 }: VibrationChartProps) {
  const sortedReadings = useMemo(() =>
    [...readings].sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    [readings]
  );

  const xAxisData = useMemo(() =>
    sortedReadings.map(r => dayjs(r.timestamp).format('MM-DD HH:mm')),
    [sortedReadings]
  );

  const xData = useMemo(() => sortedReadings.map(r => r.xAxis), [sortedReadings]);
  const yData = useMemo(() => sortedReadings.map(r => r.yAxis), [sortedReadings]);
  const zData = useMemo(() => sortedReadings.map(r => r.zAxis), [sortedReadings]);
  const overallData = useMemo(() => sortedReadings.map(r => r.overallLevel), [sortedReadings]);

  const option = {
    backgroundColor: 'transparent',
    legend: {
      data: ['X轴', 'Y轴', 'Z轴', '综合值'],
      textStyle: { color: '#7A8BA3', fontSize: 11 },
      top: 0,
      right: 10,
    },
    grid: {
      left: 50,
      right: 20,
      top: 40,
      bottom: 40,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 26, 51, 0.95)',
      borderColor: 'rgba(49, 108, 192, 0.5)',
      borderWidth: 1,
      textStyle: { color: '#E8EEF7', fontSize: 12 },
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: { lineStyle: { color: '#3E4C60' } },
      axisLabel: {
        color: '#7A8BA3',
        fontSize: 11,
        interval: Math.max(0, Math.floor(xAxisData.length / 8) - 1),
      },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'mm/s',
      nameTextStyle: { color: '#7A8BA3', fontSize: 11, padding: [0, 0, 0, -30] },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#7A8BA3', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(62, 76, 96, 0.3)', type: 'dashed' } },
    },
    series: [
      {
        name: 'X轴',
        type: 'line',
        data: xData,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#3B82F6', opacity: 0.7 },
      },
      {
        name: 'Y轴',
        type: 'line',
        data: yData,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#10B981', opacity: 0.7 },
      },
      {
        name: 'Z轴',
        type: 'line',
        data: zData,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#8B5CF6', opacity: 0.7 },
      },
      {
        name: '综合值',
        type: 'line',
        data: overallData,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2.5, color: '#EF476F' },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#EF476F', type: 'dashed', width: 1.5 },
          label: {
            formatter: `阈值 ${threshold}`,
            position: 'end',
            color: '#EF476F',
            fontSize: 11,
            backgroundColor: 'rgba(239, 71, 111, 0.1)',
            padding: [2, 6],
            borderRadius: 4,
          },
          data: [{ yAxis: threshold }],
        },
      },
    ],
  };

  return (
    <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent-purple/20">
            <Activity className="w-4 h-4 text-accent-purple" />
          </div>
          <h3 className="text-white font-semibold text-base">振动监测数据 (24h)</h3>
        </div>
        <span className="text-xs text-metal-500 bg-navy-900/50 px-2.5 py-1 rounded-full border border-navy-700/40">
          共 {readings.length} 条
        </span>
      </div>

      <div className="flex-1 min-h-[260px]">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
