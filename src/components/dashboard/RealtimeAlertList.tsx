import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { AlertTriangle, Activity, Bell, ChevronRight, Clock } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { Alert } from '@/types';
import { cn } from '@/lib/utils';

export default function RealtimeAlertList() {
  const navigate = useNavigate();
  const rawAlerts = useAppStore(state => state.alerts);
  const filterByPermission = useAppStore(state => state.filterByPermission);

  // 过滤活跃预警 + 按权限过滤 + 按严重程度排序（level 2优先）
  const alerts = filterByPermission(rawAlerts)
    .filter(a => a.status !== 'resolved')
    .sort((a, b) => {
      if (a.level !== b.level) return b.level - a.level;
      return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    });

  const getTypeIcon = (type: Alert['type']) => {
    return type === 'queue' ? (
      <Clock className="w-4 h-4" />
    ) : (
      <Activity className="w-4 h-4" />
    );
  };

  const getTypeLabel = (type: Alert['type']) => {
    return type === 'queue' ? '排队预警' : '振动预警';
  };

  const formatTime = (isoString: string) => {
    const now = dayjs();
    const target = dayjs(isoString);
    const diffMinutes = now.diff(target, 'minute');
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    const diffHours = now.diff(target, 'hour');
    if (diffHours < 24) return `${diffHours}小时前`;
    return target.format('MM-DD HH:mm');
  };

  const handleClick = () => {
    navigate('/alerts');
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent-teal/20">
              <Bell className="w-4 h-4 text-accent-teal" />
            </div>
            <h3 className="text-white font-semibold text-base">实时预警中心</h3>
            <span className="text-xs text-metal-400 ml-1">暂无活跃预警</span>
          </div>
        </div>
        <div className="py-10 text-center text-metal-400 text-sm">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          运行平稳，当前无活跃预警
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-5">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent-red/20">
            <AlertTriangle className="w-4 h-4 text-accent-red" />
          </div>
          <h3 className="text-white font-semibold text-base">实时预警中心</h3>
          <span className="text-xs bg-accent-red/20 text-accent-red px-2 py-0.5 rounded-full font-medium">
            {alerts.length} 条活跃
          </span>
        </div>
        <button
          onClick={handleClick}
          className="text-xs text-metal-400 hover:text-accent-teal flex items-center gap-0.5 transition-colors"
        >
          查看全部
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* 预警列表 */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {alerts.map(alert => (
          <div
            key={alert.id}
            onClick={handleClick}
            className={cn(
              'group relative flex items-start gap-3 p-3.5 rounded-xl cursor-pointer',
              'bg-navy-900/40 border transition-all duration-200 hover:-translate-y-0.5',
              alert.level === 2
                ? 'border-accent-red/30 hover:border-accent-red/50 hover:bg-navy-900/70'
                : 'border-accent-orange/20 hover:border-accent-orange/40 hover:bg-navy-900/70'
            )}
          >
            {/* 左侧脉冲指示点 */}
            <div className="pt-0.5 shrink-0">
              <div className="relative">
                <div
                  className={cn(
                    'w-2.5 h-2.5 rounded-full',
                    alert.level === 2 ? 'bg-accent-red' : 'bg-accent-orange'
                  )}
                />
                <div
                  className={cn(
                    'absolute inset-0 rounded-full animate-ping opacity-60',
                    alert.level === 2 ? 'bg-accent-red' : 'bg-accent-orange'
                  )}
                />
              </div>
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {/* 等级徽章 */}
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0',
                  alert.level === 2
                    ? 'bg-accent-red/20 text-accent-red'
                    : 'bg-accent-orange/20 text-accent-orange'
                )}>
                  {alert.level === 2 ? '二级预警' : '一级预警'}
                </span>
                {/* 类型标签 */}
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0',
                  alert.type === 'queue'
                    ? 'bg-accent-gold/15 text-accent-gold'
                    : 'bg-accent-purple/15 text-accent-purple'
                )}>
                  {getTypeIcon(alert.type)}
                  {getTypeLabel(alert.type)}
                </span>
                {/* 项目名 */}
                <span className="text-white text-sm font-medium truncate">
                  {alert.rideName}
                </span>
                {/* 区域 */}
                <span className="text-metal-500 text-xs">
                  · {alert.zoneName}
                </span>
              </div>
              <p className="text-metal-300 text-xs leading-relaxed line-clamp-2 mb-1.5">
                {alert.message}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-metal-500 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(alert.createdAt)}
                </span>
                {alert.handledBy && (
                  <span className="text-metal-400 text-[11px]">
                    处理中：{alert.handledBy}
                  </span>
                )}
              </div>
            </div>

            {/* 右侧箭头 */}
            <ChevronRight className="w-4 h-4 text-metal-500 group-hover:text-accent-teal transition-colors shrink-0 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
