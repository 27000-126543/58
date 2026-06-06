import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { TrendingUp } from 'lucide-react';
import type { QueueRecord } from '@/types';
import { cn } from '@/lib/utils';

interface QueueTrendChartProps {
  queueRecords: QueueRecord[];
}

type TabType = 'today' | '3days' | '7days';

const tabs: { key: TabType; label: string }[] = [
  { key: 'today', label: '今日' },
  { key: '3days', label: '近3天' },
  { key: '7days', label: '近7天' },
];

export default function QueueTrendChart({ queueRecords }: QueueTrendChartProps) {
  const [activeTab, setActiveTab] = useState<TabType>('7days');

  const filteredData = useMemo(() => {
    const now = dayjs();
    let startOfPeriod: dayjs.Dayjs;

    switch (activeTab) {
      case 'today':
        startOfPeriod = now.startOf('day');
        break;
      case '3days':
        startOfPeriod = now.subtract(2, 'day').startOf('day');
        break;
      case '7days':
      default:
        startOfPeriod = now.subtract(6, 'day').startOf('day');
        break;
    }

    return queueRecords
      .filter(r => dayjs(r.timestamp).isAfter(startOfPeriod))
      .sort((a, b) => dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf());
  }, [queueRecords, activeTab]);

  const xAxisData = useMemo(() => {
    if (activeTab === 'today') {
      return filteredData.map(r => dayjs(r.timestamp).format('HH:mm'));
    }
    return filteredData.map(r => dayjs(r.timestamp).format('MM-DD HH:mm'));
  }, [filteredData, activeTab]);

  const yAxisData = useMemo(() => filteredData.map(r => r.waitTime), [filteredData]);

  const option = {
    backgroundColor: 'transparent',
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
      formatter: (params: { axisValue: string; value: number }[]) => {
        const p = params[0];
        return `<div style="padding: 4px 8px">
          <div style="color: #9BADCC; font-size: 11px; margin-bottom: 4px">${p.axisValue}</div>
          <div style="display: flex; align-items: center; gap: 6px">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #00D4AA"></span>
            <span>等待时长: <b style="color: #00D4AA">${p.value}</b> 分钟</span>
          </div>
        </div>`;
      },
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: { lineStyle: { color: '#3E4C60' } },
      axisLabel: {
        color: '#7A8BA3',
        fontSize: 11,
        interval: activeTab === 'today' ? 1 : Math.floor(xAxisData.length / 8),
      },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      nameTextStyle: { color: '#7A8BA3', fontSize: 11, padding: [0, 0, 0, -30] },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#7A8BA3', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(62, 76, 96, 0.3)', type: 'dashed' } },
    },
    series: [
      {
        name: '等待时长',
        type: 'line',
        data: yAxisData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 0,
        lineStyle: { width: 2.5, color: '#00D4AA' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 170, 0.35)' },
              { offset: 1, color: 'rgba(0, 212, 170, 0.02)' },
            ],
          },
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#EF476F', type: 'dashed', width: 1.5 },
          label: {
            formatter: '预警线 60分钟',
            position: 'end',
            color: '#EF476F',
            fontSize: 11,
            backgroundColor: 'rgba(239, 71, 111, 0.1)',
            padding: [2, 6],
            borderRadius: 4,
          },
          data: [{ yAxis: 60 }],
        },
      },
    ],
  };

  return (
    <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent-teal/20">
            <TrendingUp className="w-4 h-4 text-accent-teal" />
          </div>
          <h3 className="text-white font-semibold text-base">排队时长趋势</h3>
        </div>

        <div className="flex items-center gap-1 bg-navy-900/50 rounded-lg p-1 border border-navy-700/40">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-accent-teal/20 text-accent-teal'
                  : 'text-metal-400 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
