import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { Ride } from '@/types';
import { cn } from '@/lib/utils';

export default function RideRanking() {
  const navigate = useNavigate();
  const rawRides = useAppStore(state => state.rides);
  const filterByPermission = useAppStore(state => state.filterByPermission);

  // 按权限过滤 + 按等待时间降序排序 + 取TOP10
  const rides = filterByPermission(rawRides)
    .sort((a, b) => b.currentWaitTime - a.currentWaitTime)
    .slice(0, 10);

  const maxWaitTime = Math.max(...rides.map(r => r.currentWaitTime), 1);

  // 排名徽章颜色
  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'bg-accent-gold text-navy-900';
    if (rank === 2) return 'bg-metal-300 text-navy-900';
    if (rank === 3) return 'bg-accent-orange text-white';
    return 'bg-navy-700/60 text-metal-300';
  };

  // 热度条颜色
  const getBarColor = (waitTime: number) => {
    const ratio = waitTime / maxWaitTime;
    if (ratio > 0.75) return 'from-accent-red to-accent-orange';
    if (ratio > 0.5) return 'from-accent-orange to-accent-gold';
    return 'from-accent-teal to-accent-purple';
  };

  const handleClick = (ride: Ride) => {
    navigate(`/project/${ride.id}`);
  };

  return (
    <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-5 h-full flex flex-col">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 rounded-lg bg-accent-gold/20">
          <Trophy className="w-4 h-4 text-accent-gold" />
        </div>
        <h3 className="text-white font-semibold text-base">项目热度排名 TOP10</h3>
      </div>

      {/* 列表 */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {rides.map((ride, index) => {
          const rank = index + 1;
          const barWidth = (ride.currentWaitTime / maxWaitTime) * 100;

          return (
            <div
              key={ride.id}
              onClick={() => handleClick(ride)}
              className={cn(
                'group relative flex items-center gap-3 p-3 rounded-xl',
                'bg-navy-900/40 border border-navy-700/30',
                'hover:bg-navy-900/70 hover:border-navy-600/50 cursor-pointer',
                'transition-all duration-200 hover:translate-x-1'
              )}
            >
              {/* 排名徽章 */}
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                getRankBadgeClass(rank)
              )}>
                {rank}
              </div>

              {/* 项目图标和名称 */}
              <div className="flex items-center gap-2 shrink-0 w-32">
                <span className="text-xl">{ride.icon}</span>
                <div className="min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {ride.name}
                  </div>
                  <div className="text-metal-500 text-xs truncate">
                    {ride.zoneName}
                  </div>
                </div>
              </div>

              {/* 热度条形图 */}
              <div className="flex-1 relative h-6">
                <div className="absolute inset-y-0 left-0 flex items-center w-full">
                  <div className="h-2 w-full bg-navy-700/40 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                        getBarColor(ride.currentWaitTime)
                      )}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 等待时间 */}
              <div className="flex items-center gap-1 shrink-0 w-20 justify-end">
                <Clock className="w-3.5 h-3.5 text-metal-400" />
                <span className="font-mono text-sm text-white font-medium">
                  {ride.currentWaitTime}<span className="text-metal-400 text-xs ml-0.5">分</span>
                </span>
              </div>

              {/* 箭头 */}
              <ChevronRight className="w-4 h-4 text-metal-500 group-hover:text-accent-teal transition-colors shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
