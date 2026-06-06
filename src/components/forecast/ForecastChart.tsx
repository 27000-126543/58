import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { TrendingUp, Users, Clock } from 'lucide-react';
import type { ForecastData } from '@/types';

interface ForecastChartProps {
  data: ForecastData[];
}

export default function ForecastChart({ data }: ForecastChartProps) {
  const chartOption = useMemo(() => {
    const timeLabels = data.map(d => dayjs(d.timestamp).format('HH:mm'));
    const historicalData = data.map(d => d.historicalVisitors ?? null);
    const predictedData = data.map(d => d.historicalVisitors === undefined ? d.predictedVisitors : null);
    const lowerBound = data.map(d => d.lowerBound);
    const upperBound = data.map(d => d.upperBound);

    const nowIndex = data.findIndex(d => d.historicalVisitors === undefined);

    const peakIndex = data.reduce((maxIdx, d, idx, arr) =>
      d.predictedVisitors > arr[maxIdx].predictedVisitors ? idx : maxIdx, 0);
    const peakTime = dayjs(data[peakIndex].timestamp).format('HH:mm');
    const peakValue = data[peakIndex].predictedVisitors;
    const totalPredicted = data
      .filter(d => d.historicalVisitors === undefined)
      .reduce((sum, d) => sum + d.predictedVisitors, 0);

    const peakStart = Math.max(0, peakIndex - 2);
    const peakEnd = Math.min(data.length - 1, peakIndex + 2);

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
          formatter: (params: any[]) => {
            const time = params[0].axisValue;
            let html = `<div class="font-semibold mb-2">${time}</div>`;
            params.forEach((p: any) => {
              if (p.value !== null && p.value !== undefined && p.seriesName !== '置信上限' && p.seriesName !== '置信下限') {
                html += `<div class="flex items-center gap-2 text-xs">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
                  <span>${p.seriesName}:</span>
                  <span class="font-mono font-semibold">${p.value?.toLocaleString()} 人</span>
                </div>`;
              }
            });
            return html;
          },
        },
        legend: {
          data: ['历史客流', '预测客流', '置信区间'],
          top: 0,
          right: 0,
          textStyle: { color: '#9BADCC', fontSize: 12 },
          itemWidth: 16,
          itemHeight: 10,
          icon: 'roundRect',
        },
        grid: {
          left: '3%',
          right: '3%',
          top: 50,
          bottom: 30,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: timeLabels,
          boundaryGap: false,
          axisLine: { lineStyle: { color: 'rgba(155, 173, 204, 0.2)' } },
          axisLabel: {
            color: '#7A8BA3',
            fontSize: 11,
            interval: Math.floor(data.length / 10),
          },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value',
          name: '人数',
          nameTextStyle: { color: '#7A8BA3', fontSize: 11, padding: [0, 0, 0, -20] },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#7A8BA3', fontSize: 11, formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v },
          splitLine: { lineStyle: { color: 'rgba(155, 173, 204, 0.1)', type: 'dashed' } },
        },
        series: [
          {
            name: '高峰时段',
            type: 'line',
            data: [],
            markArea: {
              silent: true,
              itemStyle: { color: 'rgba(255, 107, 53, 0.1)' },
              data: [[
                { xAxis: peakStart, name: '高峰时段' },
                { xAxis: peakEnd },
              ]],
            },
          },
          {
            name: '置信上限',
            type: 'line',
            data: upperBound,
            lineStyle: { opacity: 0 },
            symbol: 'none',
            stack: 'confidence',
          },
          {
            name: '置信区间',
            type: 'line',
            data: lowerBound.map((v, i) => upperBound[i] - v),
            lineStyle: { opacity: 0 },
            symbol: 'none',
            stack: 'confidence',
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 212, 170, 0.25)' },
                  { offset: 1, color: 'rgba(0, 212, 170, 0.05)' },
                ],
              },
            },
          },
          {
            name: '置信下限',
            type: 'line',
            data: lowerBound,
            lineStyle: { opacity: 0 },
            symbol: 'none',
          },
          {
            name: '历史客流',
            type: 'line',
            data: historicalData,
            smooth: true,
            symbol: 'none',
            lineStyle: {
              color: '#316CC0',
              width: 3,
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(49, 108, 192, 0.3)' },
                  { offset: 1, color: 'rgba(49, 108, 192, 0)' },
                ],
              },
            },
          },
          {
            name: '预测客流',
            type: 'line',
            data: predictedData,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            showSymbol: true,
            lineStyle: {
              color: '#00D4AA',
              width: 3,
            },
            itemStyle: {
              color: '#00D4AA',
              borderColor: '#0A1A33',
              borderWidth: 2,
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 212, 170, 0.35)' },
                  { offset: 1, color: 'rgba(0, 212, 170, 0)' },
                ],
              },
            },
            markLine: nowIndex > 0 ? {
              silent: true,
              symbol: 'none',
              lineStyle: { color: '#FF6B35', type: 'dashed', width: 2 },
              data: [{ xAxis: nowIndex, label: { formatter: '现在', color: '#FF6B35', fontSize: 11, position: 'end' } }],
            } : undefined,
            markPoint: {
              symbol: 'pin',
              symbolSize: 50,
              itemStyle: { color: '#FF6B35' },
              label: { color: '#fff', fontSize: 11, fontWeight: 'bold', formatter: '{c}' },
              data: [{
                name: '峰值',
                coord: [peakIndex, peakValue],
                value: peakValue.toLocaleString(),
              }],
            },
          },
        ],
      },
      summary: { peakTime, peakValue, totalPredicted },
    };
  }, [data]);

  return (
    <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-accent-teal/20">
          <TrendingUp className="w-5 h-5 text-accent-teal" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-base">48小时客流预测曲线</h3>
          <p className="text-metal-400 text-xs">过去6小时 + 未来48小时</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ReactECharts
          option={chartOption.option}
          style={{ height: '100%', minHeight: 320 }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-navy-700/50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-accent-orange mb-1">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">峰值人数</span>
          </div>
          <p className="text-white font-mono text-xl font-bold">
            {chartOption.summary.peakValue.toLocaleString()}
          </p>
          <p className="text-metal-500 text-xs">人</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-accent-teal mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">峰值时间</span>
          </div>
          <p className="text-white font-mono text-xl font-bold">
            {chartOption.summary.peakTime}
          </p>
          <p className="text-metal-500 text-xs">今日</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-accent-purple mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">总预计客流</span>
          </div>
          <p className="text-white font-mono text-xl font-bold">
            {(chartOption.summary.totalPredicted / 10000).toFixed(1)}
          </p>
          <p className="text-metal-500 text-xs">万人次</p>
        </div>
      </div>
    </div>
  );
}
