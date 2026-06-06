import { useState } from 'react';
import { MapPin, Users, Maximize2, Flame } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { Zone } from '@/types';
import { cn } from '@/lib/utils';

// 区域在SVG中的位置配置（圆角矩形布局）
const zonePositions = [
  { x: 20, y: 20, w: 160, h: 100 },
  { x: 200, y: 20, w: 160, h: 100 },
  { x: 380, y: 20, w: 160, h: 100 },
  { x: 20, y: 140, w: 160, h: 100 },
  { x: 200, y: 140, w: 160, h: 100 },
  { x: 380, y: 140, w: 160, h: 100 },
];

// 根据热度值计算颜色（从青到红渐变）
function getHeatColor(heatLevel: number): string {
  const clamped = Math.max(0, Math.min(100, heatLevel));
  const t = clamped / 100;
  // 青色 #00D4AA -> 黄色 #FFD166 -> 红色 #EF476F
  let r, g, b;
  if (t < 0.5) {
    const tt = t * 2;
    r = Math.round(0 + (255 - 0) * tt);
    g = Math.round(212 + (209 - 212) * tt);
    b = Math.round(170 + (102 - 170) * tt);
  } else {
    const tt = (t - 0.5) * 2;
    r = Math.round(255 + (239 - 255) * tt);
    g = Math.round(209 + (71 - 209) * tt);
    b = Math.round(102 + (111 - 102) * tt);
  }
  return `rgb(${r}, ${g}, ${b})`;
}

export default function ZoneHeatMap() {
  const zones = useAppStore(state => state.zones);
  const [hoveredZone, setHoveredZone] = useState<Zone | null>(null);

  return (
    <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl border border-navy-700/50 p-5 h-full">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 rounded-lg bg-accent-teal/20">
          <Flame className="w-4 h-4 text-accent-teal" />
        </div>
        <h3 className="text-white font-semibold text-base">区域客流热力分布</h3>
      </div>

      {/* 热力图 */}
      <div className="relative">
        <svg
          viewBox="0 0 560 260"
          className="w-full h-auto"
          style={{ maxHeight: '280px' }}
        >
          <defs>
            {zones.map((zone, idx) => {
              const color = getHeatColor(zone.heatLevel);
              return (
                <linearGradient key={zone.id} id={`grad-${zone.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.5" />
                </linearGradient>
              );
            })}
          </defs>

          {zones.map((zone, idx) => {
            const pos = zonePositions[idx];
            const color = getHeatColor(zone.heatLevel);
            const isHovered = hoveredZone?.id === zone.id;

            return (
              <g
                key={zone.id}
                onMouseEnter={() => setHoveredZone(zone)}
                onMouseLeave={() => setHoveredZone(null)}
                className="cursor-pointer transition-all duration-200"
              >
                {/* 背景发光 */}
                {isHovered && (
                  <rect
                    x={pos.x - 3}
                    y={pos.y - 3}
                    width={pos.w + 6}
                    height={pos.h + 6}
                    rx={14}
                    fill={color}
                    opacity="0.3"
                    className="animate-pulse-slow"
                  />
                )}
                {/* 主矩形 */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={pos.w}
                  height={pos.h}
                  rx={10}
                  fill={`url(#grad-${zone.id})`}
                  stroke={color}
                  strokeWidth={isHovered ? 2 : 1}
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-all duration-200"
                />
                {/* 区域名称 */}
                <text
                  x={pos.x + pos.w / 2}
                  y={pos.y + pos.h / 2 - 8}
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="600"
                  className="select-none"
                >
                  {zone.name}
                </text>
                {/* 热度百分比 */}
                <text
                  x={pos.x + pos.w / 2}
                  y={pos.y + pos.h / 2 + 16}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.9)"
                  fontSize="12"
                  className="select-none font-mono"
                >
                  热度 {zone.heatLevel}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredZone && (
          <div
            className="absolute z-20 bg-navy-900/95 backdrop-blur-md border border-navy-600/50 rounded-xl p-4 shadow-xl pointer-events-none animate-fade-in-up min-w-[200px]"
            style={{
              top: '8px',
              right: '8px',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getHeatColor(hoveredZone.heatLevel) }}
              />
              <span className="text-white font-semibold text-sm">{hoveredZone.name}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-metal-400">
                  <Users className="w-3.5 h-3.5" />
                  当前游客
                </span>
                <span className="text-white font-mono font-medium">
                  {hoveredZone.visitorCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-metal-400">
                  <Maximize2 className="w-3.5 h-3.5" />
                  最大容量
                </span>
                <span className="text-white font-mono font-medium">
                  {hoveredZone.capacity.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-metal-400">
                  <Flame className="w-3.5 h-3.5" />
                  热度占比
                </span>
                <span
                  className="font-mono font-medium"
                  style={{ color: getHeatColor(hoveredZone.heatLevel) }}
                >
                  {hoveredZone.heatLevel}%
                </span>
              </div>
              {/* 容量进度条 */}
              <div className="mt-2 pt-2 border-t border-navy-700/50">
                <div className="h-1.5 w-full bg-navy-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${hoveredZone.heatLevel}%`,
                      backgroundColor: getHeatColor(hoveredZone.heatLevel),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 颜色图例 */}
      <div className="mt-5 flex items-center justify-center gap-2">
        <span className="text-xs text-metal-400 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          低
        </span>
        <div className="flex-1 max-w-[200px] h-2 rounded-full bg-gradient-to-r from-accent-teal via-accent-gold to-accent-red" />
        <span className="text-xs text-metal-400">高</span>
      </div>
    </div>
  );
}
