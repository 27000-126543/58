import { RefreshCw, TrendingUp, Lightbulb } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import FileUploader from '@/components/forecast/FileUploader';
import ForecastChart from '@/components/forecast/ForecastChart';
import StrategyCard from '@/components/forecast/StrategyCard';
import dayjs from 'dayjs';

export default function Forecast() {
  const forecastData = useAppStore(state => state.forecastData);
  const strategies = useAppStore(state => state.strategies);
  const regenerateForecast = useAppStore(state => state.regenerateForecast);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">客流预测</h1>
          <p className="text-metal-400 mt-1">智能预测园区未来客流趋势，辅助运营决策</p>
          <p className="text-metal-500 text-xs mt-1">
            预测时间：{dayjs().format('YYYY年MM月DD日 HH:mm')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-teal/10 border border-accent-teal/20">
          <div className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
          <span className="text-accent-teal text-xs font-medium">AI 预测模型运行中</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <FileUploader
            title="天气预报数据"
            subtitle="支持未来7天天气预报Excel文件"
            type="weather"
          />
          <FileUploader
            title="活动预案数据"
            subtitle="园区活动、节假日安排等影响因子"
            type="event"
          />

          <button
            onClick={regenerateForecast}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-accent-teal/20 to-accent-orange/20 
                       border border-accent-teal/30 text-white font-medium
                       hover:from-accent-teal/30 hover:to-accent-orange/30 
                       transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <RefreshCw className="w-5 h-5 text-accent-teal group-hover:rotate-180 transition-transform duration-500" />
            重新生成预测
          </button>

          <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-accent-purple/20">
                <Lightbulb className="w-4 h-4 text-accent-purple" />
              </div>
              <h3 className="text-white font-semibold text-sm">预测说明</h3>
            </div>
            <ul className="space-y-2 text-xs text-metal-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-teal mt-1.5 flex-shrink-0" />
                基于过去30天历史数据，结合天气、节假日、活动等多维度因子
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-orange mt-1.5 flex-shrink-0" />
                置信区间反映预测不确定性，越窄模型越稳定
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-purple mt-1.5 flex-shrink-0" />
                模型每小时自动更新，可手动刷新重新计算
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3">
          <ForecastChart data={forecastData} />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-accent-orange/20">
            <TrendingUp className="w-5 h-5 text-accent-orange" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">智能策略推荐</h2>
            <p className="text-metal-400 text-xs">基于客流预测自动生成运营优化策略</p>
          </div>
          <span className="ml-auto px-2.5 py-1 rounded-lg bg-navy-700/60 text-metal-300 text-xs font-medium">
            共 {strategies.length} 条建议
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategies.map(strategy => (
            <StrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </div>
      </div>
    </div>
  );
}
