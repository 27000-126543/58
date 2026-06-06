import dayjs from 'dayjs';
import type {
  Zone, Ride, Alert, QueueRecord, EquipmentFault, MaintenanceRecord,
  RestaurantData, StaffShift, ForecastData, StrategyRecommendation,
  WeeklyReport, User, GlobalMetrics
} from '@/types';

export const mockZones: Zone[] = [
  { id: 'zone-1', name: '奇幻大道', visitorCount: 3820, capacity: 5000, heatLevel: 76, color: '#9B5DE5' },
  { id: 'zone-2', name: '冒险岛', visitorCount: 4210, capacity: 4500, heatLevel: 93, color: '#FF6B35' },
  { id: 'zone-3', name: '童话镇', visitorCount: 2890, capacity: 4000, heatLevel: 72, color: '#00D4AA' },
  { id: 'zone-4', name: '未来城', visitorCount: 3560, capacity: 4800, heatLevel: 74, color: '#316CC0' },
  { id: 'zone-5', name: '海洋王国', visitorCount: 3100, capacity: 4200, heatLevel: 74, color: '#00BBF9' },
  { id: 'zone-6', name: '恐龙谷', visitorCount: 2650, capacity: 3800, heatLevel: 70, color: '#70E000' },
];

const rideIcons = ['🎢', '🎡', '🎠', '🎪', '🎯', '🚀', '🌊', '🦕', '🏰', '🎭'];

export const mockRides: Ride[] = [
  { id: 'ride-1', name: '极速过山车', zoneId: 'zone-2', zoneName: '冒险岛', currentWaitTime: 85, avgWaitTime: 52, capacity: 1200, availability: 96.5, satisfaction: 4.7, status: 'warning', vibrationLevel: 3.8, vibrationThreshold: 5.0, todayRides: 186, icon: '🎢' },
  { id: 'ride-2', name: '旋转木马', zoneId: 'zone-3', zoneName: '童话镇', currentWaitTime: 15, avgWaitTime: 12, capacity: 800, availability: 99.2, satisfaction: 4.5, status: 'normal', vibrationLevel: 0.8, vibrationThreshold: 2.0, todayRides: 320, icon: '🎠' },
  { id: 'ride-3', name: '太空漫游', zoneId: 'zone-4', zoneName: '未来城', currentWaitTime: 68, avgWaitTime: 45, capacity: 900, availability: 94.8, satisfaction: 4.6, status: 'warning', vibrationLevel: 4.2, vibrationThreshold: 5.0, todayRides: 142, icon: '🚀' },
  { id: 'ride-4', name: '深海探险', zoneId: 'zone-5', zoneName: '海洋王国', currentWaitTime: 42, avgWaitTime: 35, capacity: 1000, availability: 97.3, satisfaction: 4.4, status: 'normal', vibrationLevel: 2.1, vibrationThreshold: 4.0, todayRides: 198, icon: '🌊' },
  { id: 'ride-5', name: '恐龙大逃亡', zoneId: 'zone-6', zoneName: '恐龙谷', currentWaitTime: 95, avgWaitTime: 68, capacity: 800, availability: 92.1, satisfaction: 4.8, status: 'warning', vibrationLevel: 5.8, vibrationThreshold: 5.0, todayRides: 125, icon: '🦕' },
  { id: 'ride-6', name: '魔法城堡', zoneId: 'zone-1', zoneName: '奇幻大道', currentWaitTime: 35, avgWaitTime: 28, capacity: 1500, availability: 98.7, satisfaction: 4.6, status: 'normal', vibrationLevel: 1.2, vibrationThreshold: 3.0, todayRides: 245, icon: '🏰' },
  { id: 'ride-7', name: '摩天轮', zoneId: 'zone-1', zoneName: '奇幻大道', currentWaitTime: 25, avgWaitTime: 20, capacity: 600, availability: 99.5, satisfaction: 4.3, status: 'normal', vibrationLevel: 0.5, vibrationThreshold: 2.0, todayRides: 85, icon: '🎡' },
  { id: 'ride-8', name: '海盗船', zoneId: 'zone-2', zoneName: '冒险岛', currentWaitTime: 48, avgWaitTime: 38, capacity: 700, availability: 95.6, satisfaction: 4.4, status: 'normal', vibrationLevel: 3.2, vibrationThreshold: 4.5, todayRides: 210, icon: '⚓' },
  { id: 'ride-9', name: '激流勇进', zoneId: 'zone-2', zoneName: '冒险岛', currentWaitTime: 72, avgWaitTime: 55, capacity: 900, availability: 93.4, satisfaction: 4.7, status: 'normal', vibrationLevel: 2.8, vibrationThreshold: 4.0, todayRides: 168, icon: '💦' },
  { id: 'ride-10', name: '小飞象', zoneId: 'zone-3', zoneName: '童话镇', currentWaitTime: 18, avgWaitTime: 15, capacity: 500, availability: 99.0, satisfaction: 4.2, status: 'normal', vibrationLevel: 0.6, vibrationThreshold: 2.0, todayRides: 280, icon: '🐘' },
  { id: 'ride-11', name: '鬼屋探险', zoneId: 'zone-3', zoneName: '童话镇', currentWaitTime: 55, avgWaitTime: 40, capacity: 600, availability: 96.8, satisfaction: 4.5, status: 'normal', vibrationLevel: 1.8, vibrationThreshold: 3.0, todayRides: 175, icon: '👻' },
  { id: 'ride-12', name: '激光战舰', zoneId: 'zone-4', zoneName: '未来城', currentWaitTime: 38, avgWaitTime: 30, capacity: 700, availability: 97.9, satisfaction: 4.3, status: 'normal', vibrationLevel: 1.5, vibrationThreshold: 3.5, todayRides: 220, icon: '🛸' },
  { id: 'ride-13', name: '4D影院', zoneId: 'zone-4', zoneName: '未来城', currentWaitTime: 22, avgWaitTime: 18, capacity: 400, availability: 98.5, satisfaction: 4.6, status: 'normal', vibrationLevel: 0.3, vibrationThreshold: 1.5, todayRides: 96, icon: '🎬' },
  { id: 'ride-14', name: '海豚湾表演', zoneId: 'zone-5', zoneName: '海洋王国', currentWaitTime: 30, avgWaitTime: 25, capacity: 1200, availability: 99.8, satisfaction: 4.8, status: 'normal', vibrationLevel: 0.2, vibrationThreshold: 1.0, todayRides: 8, icon: '🐬' },
  { id: 'ride-15', name: '海底观光隧道', zoneId: 'zone-5', zoneName: '海洋王国', currentWaitTime: 12, avgWaitTime: 10, capacity: 2000, availability: 99.9, satisfaction: 4.5, status: 'normal', vibrationLevel: 0.1, vibrationThreshold: 1.0, todayRides: 450, icon: '🐠' },
  { id: 'ride-16', name: '侏罗纪漂流', zoneId: 'zone-6', zoneName: '恐龙谷', currentWaitTime: 58, avgWaitTime: 48, capacity: 850, availability: 94.2, satisfaction: 4.6, status: 'normal', vibrationLevel: 2.5, vibrationThreshold: 4.0, todayRides: 156, icon: '🚣' },
  { id: 'ride-17', name: '大摆锤', zoneId: 'zone-2', zoneName: '冒险岛', currentWaitTime: 0, avgWaitTime: 35, capacity: 600, availability: 0, satisfaction: 4.5, status: 'maintenance', vibrationLevel: 0, vibrationThreshold: 5.0, todayRides: 0, icon: '🎡' },
  { id: 'ride-18', name: '碰碰车', zoneId: 'zone-1', zoneName: '奇幻大道', currentWaitTime: 28, avgWaitTime: 22, capacity: 400, availability: 98.2, satisfaction: 4.1, status: 'normal', vibrationLevel: 1.8, vibrationThreshold: 3.0, todayRides: 310, icon: '🚗' },
  { id: 'ride-19', name: '高空飞翔', zoneId: 'zone-4', zoneName: '未来城', currentWaitTime: 45, avgWaitTime: 38, capacity: 500, availability: 96.1, satisfaction: 4.4, status: 'normal', vibrationLevel: 2.9, vibrationThreshold: 4.0, todayRides: 132, icon: '🪂' },
  { id: 'ride-20', name: '恐龙化石挖掘', zoneId: 'zone-6', zoneName: '恐龙谷', currentWaitTime: 8, avgWaitTime: 6, capacity: 300, availability: 99.5, satisfaction: 4.0, status: 'normal', vibrationLevel: 0.1, vibrationThreshold: 1.0, todayRides: 420, icon: '🦴' },
];

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1', type: 'queue', level: 2, rideId: 'ride-5', rideName: '恐龙大逃亡', zoneId: 'zone-6', zoneName: '恐龙谷',
    message: '排队时长已连续75分钟超过60分钟，当前等待时间95分钟',
    createdAt: dayjs().subtract(75, 'minute').toISOString(), escalatedAt: dayjs().subtract(15, 'minute').toISOString(),
    status: 'escalated',
    approvalFlow: {
      id: 'flow-1', alertId: 'alert-1', currentStep: 1, actionType: 'fast_pass', actionTypeName: '加开快速通道',
      steps: [
        { role: 'zone_manager', roleName: '区域经理', userName: '张伟', status: 'approved', approvedAt: dayjs().subtract(10, 'minute').toISOString(), comment: '同意，客流高峰明显' },
        { role: 'director', roleName: '运营总监', status: 'pending' },
        { role: 'gm', roleName: '园区总经理', status: 'pending' },
      ]
    }
  },
  {
    id: 'alert-2', type: 'vibration', level: 1, rideId: 'ride-3', rideName: '太空漫游', zoneId: 'zone-4', zoneName: '未来城',
    message: '设备振动值达到4.2mm/s，接近阈值5.0mm/s，需密切关注',
    createdAt: dayjs().subtract(20, 'minute').toISOString(), status: 'active', handledBy: '李明（维修班组）'
  },
  {
    id: 'alert-3', type: 'queue', level: 1, rideId: 'ride-1', rideName: '极速过山车', zoneId: 'zone-2', zoneName: '冒险岛',
    message: '排队时长已连续35分钟超过60分钟，当前等待时间85分钟',
    createdAt: dayjs().subtract(35, 'minute').toISOString(), status: 'processing', handledBy: '王芳（运营主管）'
  },
  {
    id: 'alert-4', type: 'vibration', level: 1, rideId: 'ride-5', rideName: '恐龙大逃亡', zoneId: 'zone-6', zoneName: '恐龙谷',
    message: '设备振动值异常，达到5.8mm/s，超过阈值5.0mm/s',
    createdAt: dayjs().subtract(50, 'minute').toISOString(), status: 'processing', handledBy: '赵强（维修班组）'
  },
  {
    id: 'alert-5', type: 'queue', level: 2, rideId: 'ride-9', rideName: '激流勇进', zoneId: 'zone-2', zoneName: '冒险岛',
    message: '排队时长超过60分钟达1小时20分未缓解，升级为二级预警',
    createdAt: dayjs().subtract(80, 'minute').toISOString(), escalatedAt: dayjs().subtract(20, 'minute').toISOString(),
    status: 'escalated',
    approvalFlow: {
      id: 'flow-2', alertId: 'alert-5', currentStep: 2, actionType: 'restrict_flow', actionTypeName: '临时限流',
      steps: [
        { role: 'zone_manager', roleName: '区域经理', userName: '陈静', status: 'approved', approvedAt: dayjs().subtract(18, 'minute').toISOString(), comment: '客流持续偏高，建议限流' },
        { role: 'director', roleName: '运营总监', userName: '刘洋', status: 'approved', approvedAt: dayjs().subtract(5, 'minute').toISOString(), comment: '批准限流，同时安排增加快速通道票' },
        { role: 'gm', roleName: '园区总经理', status: 'pending' },
      ]
    }
  },
  {
    id: 'alert-6', type: 'queue', level: 1, rideId: 'ride-9', rideName: '激流勇进', zoneId: 'zone-2', zoneName: '冒险岛',
    message: '排队时长已连续40分钟超过60分钟，当前等待时间72分钟',
    createdAt: dayjs().subtract(40, 'minute').toISOString(), status: 'processing'
  },
];

function generateQueueRecords(rideId: string, baseWait: number, variance: number): QueueRecord[] {
  const records: QueueRecord[] = [];
  for (let d = 6; d >= 0; d--) {
    for (let h = 9; h <= 21; h++) {
      const hourFactor = h >= 11 && h <= 14 ? 1.8 : h >= 16 && h <= 19 ? 1.5 : 0.8;
      const dayFactor = d === 0 || d === 6 ? 1.3 : 1.0;
      const randomFactor = 0.7 + Math.random() * 0.6;
      records.push({
        rideId,
        timestamp: dayjs().subtract(d, 'day').hour(h).minute(0).second(0).toISOString(),
        waitTime: Math.max(0, Math.round(baseWait * hourFactor * dayFactor * randomFactor + (Math.random() - 0.5) * variance))
      });
    }
  }
  return records;
}

export const mockQueueRecords: Record<string, QueueRecord[]> = {
  'ride-1': generateQueueRecords('ride-1', 50, 25),
  'ride-2': generateQueueRecords('ride-2', 12, 8),
  'ride-3': generateQueueRecords('ride-3', 45, 20),
  'ride-4': generateQueueRecords('ride-4', 35, 15),
  'ride-5': generateQueueRecords('ride-5', 68, 30),
  'ride-6': generateQueueRecords('ride-6', 28, 12),
  'ride-7': generateQueueRecords('ride-7', 20, 10),
  'ride-8': generateQueueRecords('ride-8', 38, 18),
  'ride-9': generateQueueRecords('ride-9', 55, 22),
  'ride-10': generateQueueRecords('ride-10', 15, 8),
  'ride-11': generateQueueRecords('ride-11', 40, 18),
  'ride-12': generateQueueRecords('ride-12', 30, 14),
  'ride-13': generateQueueRecords('ride-13', 18, 8),
  'ride-14': generateQueueRecords('ride-14', 25, 12),
  'ride-15': generateQueueRecords('ride-15', 10, 5),
  'ride-16': generateQueueRecords('ride-16', 48, 20),
  'ride-17': generateQueueRecords('ride-17', 35, 15),
  'ride-18': generateQueueRecords('ride-18', 22, 10),
  'ride-19': generateQueueRecords('ride-19', 38, 16),
  'ride-20': generateQueueRecords('ride-20', 6, 4),
};

export const mockEquipmentFaults: EquipmentFault[] = [
  { id: 'fault-1', rideId: 'ride-1', type: '液压系统', description: '主油缸密封圈漏油，压力下降15%', occurredAt: dayjs().subtract(2, 'day').hour(14).toISOString(), resolvedAt: dayjs().subtract(2, 'day').hour(16).toISOString(), severity: 'medium' },
  { id: 'fault-2', rideId: 'ride-3', type: '传感器', description: '位置传感器信号异常，校准后恢复', occurredAt: dayjs().subtract(3, 'day').hour(10).toISOString(), resolvedAt: dayjs().subtract(3, 'day').hour(10).minute(30).toISOString(), severity: 'low' },
  { id: 'fault-3', rideId: 'ride-5', type: '传动系统', description: '齿轮箱振动值偏高，润滑油更换后正常', occurredAt: dayjs().subtract(1, 'day').hour(11).toISOString(), resolvedAt: dayjs().subtract(1, 'day').hour(14).toISOString(), severity: 'high' },
  { id: 'fault-4', rideId: 'ride-17', type: '制动系统', description: '刹车片磨损严重，已更换全套刹车片', occurredAt: dayjs().subtract(1, 'day').hour(9).toISOString(), severity: 'high' },
  { id: 'fault-5', rideId: 'ride-9', type: '电气系统', description: '控制柜温度过高，增加散热风扇', occurredAt: dayjs().subtract(4, 'day').hour(15).toISOString(), resolvedAt: dayjs().subtract(4, 'day').hour(17).toISOString(), severity: 'medium' },
  { id: 'fault-6', rideId: 'ride-1', type: '安全系统', description: '安全门锁接触不良，已更换开关', occurredAt: dayjs().subtract(5, 'day').hour(13).toISOString(), resolvedAt: dayjs().subtract(5, 'day').hour(13).minute(45).toISOString(), severity: 'high' },
  { id: 'fault-7', rideId: 'ride-16', type: '水泵系统', description: '主水泵流量不足，清理滤网后恢复', occurredAt: dayjs().subtract(6, 'day').hour(16).toISOString(), resolvedAt: dayjs().subtract(6, 'day').hour(18).toISOString(), severity: 'low' },
  { id: 'fault-8', rideId: 'ride-3', type: '传动系统', description: '传送带张紧度不足，已调整', occurredAt: dayjs().subtract(2, 'day').hour(17).toISOString(), resolvedAt: dayjs().subtract(2, 'day').hour(17).minute(20).toISOString(), severity: 'low' },
];

export const mockMaintenanceRecords: MaintenanceRecord[] = [
  { id: 'maint-1', rideId: 'ride-1', type: '定期维保', description: '月度全面检修，液压系统检查，电气系统测试', technician: '李明', startedAt: dayjs().subtract(10, 'day').hour(22).toISOString(), completedAt: dayjs().subtract(10, 'day').hour(23).minute(30).toISOString(), partsReplaced: ['液压油滤芯', '密封圈×4'], cost: 2800 },
  { id: 'maint-2', rideId: 'ride-5', type: '故障维修', description: '齿轮箱振动异常处理，更换润滑油', technician: '赵强', startedAt: dayjs().subtract(1, 'day').hour(11).toISOString(), completedAt: dayjs().subtract(1, 'day').hour(14).toISOString(), partsReplaced: ['齿轮润滑油 20L', '油封×2'], cost: 5600 },
  { id: 'maint-3', rideId: 'ride-17', type: '故障维修', description: '刹车片全套更换，制动系统检测校准', technician: '王建国', startedAt: dayjs().subtract(1, 'day').hour(9).toISOString(), completedAt: dayjs().subtract(1, 'day').hour(15).toISOString(), partsReplaced: ['刹车片×8', '制动液 5L'], cost: 8200 },
  { id: 'maint-4', rideId: 'ride-9', type: '定期维保', description: '季度安全检查，水泵系统维护', technician: '李明', startedAt: dayjs().subtract(8, 'day').hour(22).toISOString(), completedAt: dayjs().subtract(8, 'day').hour(23).minute(45).toISOString(), partsReplaced: ['水泵滤网', '密封圈×2'], cost: 1800 },
  { id: 'maint-5', rideId: 'ride-3', type: '故障维修', description: '传感器校准，传送带张紧调整', technician: '张伟', startedAt: dayjs().subtract(3, 'day').hour(10).toISOString(), completedAt: dayjs().subtract(3, 'day').hour(11).toISOString(), partsReplaced: ['位置传感器×1'], cost: 1200 },
  { id: 'maint-6', rideId: 'ride-1', type: '故障维修', description: '安全门锁开关更换', technician: '赵强', startedAt: dayjs().subtract(5, 'day').hour(13).toISOString(), completedAt: dayjs().subtract(5, 'day').hour(13).minute(45).toISOString(), partsReplaced: ['安全门锁开关×2'], cost: 600 },
  { id: 'maint-7', rideId: 'ride-7', type: '定期维保', description: '摩天轮月度检查，轴承润滑', technician: '王建国', startedAt: dayjs().subtract(12, 'day').hour(7).toISOString(), completedAt: dayjs().subtract(12, 'day').hour(10).toISOString(), partsReplaced: ['高温润滑脂 5kg'], cost: 1500 },
  { id: 'maint-8', rideId: 'ride-14', type: '定期维保', description: '海豚表演池设备月度检测，水质系统维护', technician: '孙丽', startedAt: dayjs().subtract(7, 'day').hour(6).toISOString(), completedAt: dayjs().subtract(7, 'day').hour(8).toISOString(), partsReplaced: ['过滤器滤芯×3'], cost: 2200 },
];

export const mockRestaurants: RestaurantData[] = [
  { id: 'rest-1', name: '奇幻城堡餐厅', zoneId: 'zone-1', turnoverRate: 2.8, todaySales: 58600, avgWaitTime: 15, capacity: 200 },
  { id: 'rest-2', name: '星光甜品店', zoneId: 'zone-1', turnoverRate: 4.2, todaySales: 23400, avgWaitTime: 5, capacity: 60 },
  { id: 'rest-3', name: '海盗烧烤吧', zoneId: 'zone-2', turnoverRate: 2.5, todaySales: 72800, avgWaitTime: 20, capacity: 180 },
  { id: 'rest-4', name: '探险家快餐', zoneId: 'zone-2', turnoverRate: 3.8, todaySales: 45200, avgWaitTime: 8, capacity: 120 },
  { id: 'rest-5', name: '童话西餐厅', zoneId: 'zone-3', turnoverRate: 2.3, todaySales: 41500, avgWaitTime: 18, capacity: 150 },
  { id: 'rest-6', name: '糖果乐园', zoneId: 'zone-3', turnoverRate: 5.1, todaySales: 18900, avgWaitTime: 3, capacity: 40 },
  { id: 'rest-7', name: '太空科技餐厅', zoneId: 'zone-4', turnoverRate: 2.6, todaySales: 52300, avgWaitTime: 12, capacity: 180 },
  { id: 'rest-8', name: '未来能量站', zoneId: 'zone-4', turnoverRate: 4.5, todaySales: 31200, avgWaitTime: 6, capacity: 80 },
  { id: 'rest-9', name: '海景海鲜楼', zoneId: 'zone-5', turnoverRate: 2.1, todaySales: 86700, avgWaitTime: 22, capacity: 220 },
  { id: 'rest-10', name: '珊瑚礁小吃', zoneId: 'zone-5', turnoverRate: 4.0, todaySales: 28900, avgWaitTime: 5, capacity: 60 },
  { id: 'rest-11', name: '恐龙主题餐厅', zoneId: 'zone-6', turnoverRate: 2.4, todaySales: 47800, avgWaitTime: 16, capacity: 160 },
  { id: 'rest-12', name: '丛林水吧', zoneId: 'zone-6', turnoverRate: 4.8, todaySales: 19500, avgWaitTime: 4, capacity: 50 },
];

export const mockStaffShifts: StaffShift[] = [
  { id: 'staff-1', name: '王芳', role: '运营主管', zoneId: 'zone-2', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-2', name: '李明', role: '维修技师', zoneId: 'zone-4', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-3', name: '赵强', role: '维修技师', zoneId: 'zone-6', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-4', name: '陈静', role: '区域经理', zoneId: 'zone-2', shift: 'morning', startTime: '08:30', endTime: '17:30' },
  { id: 'staff-5', name: '刘洋', role: '运营总监', zoneId: 'zone-1', shift: 'morning', startTime: '09:00', endTime: '18:00' },
  { id: 'staff-6', name: '张伟', role: '维修技师', zoneId: 'zone-1', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-7', name: '孙丽', role: '运营主管', zoneId: 'zone-5', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-8', name: '周杰', role: '运营主管', zoneId: 'zone-3', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-9', name: '吴磊', role: '维修技师', zoneId: 'zone-5', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-10', name: '郑华', role: '区域经理', zoneId: 'zone-4', shift: 'morning', startTime: '08:30', endTime: '17:30' },
  { id: 'staff-11', name: '王建国', role: '维修主管', zoneId: 'zone-1', shift: 'morning', startTime: '07:30', endTime: '16:30' },
  { id: 'staff-12', name: '黄敏', role: '运营主管', zoneId: 'zone-1', shift: 'evening', startTime: '12:00', endTime: '20:00' },
];

export function generateForecastData(): ForecastData[] {
  const data: ForecastData[] = [];
  const now = dayjs().startOf('hour');
  for (let h = -6; h < 48; h++) {
    const time = now.add(h, 'hour');
    const hour = time.hour();
    const dayOfWeek = time.day();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? 3500 : 2500;
    let hourFactor = 0;
    if (hour >= 9 && hour < 12) hourFactor = 0.7 + (hour - 9) * 0.1;
    else if (hour >= 12 && hour < 15) hourFactor = 1.0;
    else if (hour >= 15 && hour < 19) hourFactor = 0.9 + (hour - 15) * 0.05;
    else if (hour >= 19 && hour < 21) hourFactor = 0.6;
    else hourFactor = 0.1;
    const predicted = Math.round(base * hourFactor * (0.9 + Math.random() * 0.2));
    const historical = h < 0 ? Math.round(base * hourFactor * (0.85 + Math.random() * 0.3)) : undefined;
    data.push({
      timestamp: time.toISOString(),
      predictedVisitors: predicted,
      lowerBound: Math.round(predicted * 0.8),
      upperBound: Math.round(predicted * 1.2),
      historicalVisitors: historical,
    });
  }
  return data;
}

export const mockStrategies: StrategyRecommendation[] = [
  { id: 'strat-1', type: 'extend_hours', title: '延长冒险岛区域运营时间至22:30', description: '预测冒险岛客流高峰将持续至22:00后，建议延长运营1小时，预计可增加2500人次接待能力', expectedImpact: '增加客流接待约8%，营收提升约12万元', confidence: 92, priority: 'high' },
  { id: 'strat-2', type: 'open_fast_pass', title: '恐龙大逃亡项目加开快速通道', description: '该项目排队时长持续高位，已触发二级预警，建议每小时开放50个快速通道名额', expectedImpact: '平均等待时间降低约35%，游客满意度提升0.3分', confidence: 88, priority: 'high' },
  { id: 'strat-3', type: 'add_shows', title: '海豚湾表演增加16:30场次', description: '预测下午客流高峰，当前场次无法满足需求，建议增加一场表演', expectedImpact: '提升海洋王国区域分流能力，减少约400人次排队', confidence: 85, priority: 'medium' },
  { id: 'strat-4', type: 'add_staff', title: '午餐时段增加餐饮区服务人员', description: '11:30-13:30为餐饮高峰，各餐厅翻台率压力大，建议临时增加15名服务人员', expectedImpact: '翻台率提升约20%，餐饮等待时间减少40%', confidence: 78, priority: 'medium' },
  { id: 'strat-5', type: 'extend_hours', title: '4D影院延长夜场至21:30', description: '晚间未来城区域客流较高，影院利用率在夜间仍达75%以上', expectedImpact: '增加晚间游乐供给，提升夜间消费约5万元', confidence: 72, priority: 'low' },
];

export function generateWeeklyReports(): WeeklyReport[] {
  const reports: WeeklyReport[] = [];
  for (let i = 0; i < 4; i++) {
    const weekEnd = dayjs().subtract(i, 'week').endOf('week');
    const weekStart = weekEnd.startOf('week');
    const factor = 1 - i * 0.03;
    reports.push({
      id: `report-${i + 1}`,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      generatedAt: weekEnd.add(1, 'day').hour(8).toISOString(),
      metrics: {
        equipmentFaultRate: { current: 2.3 * factor, lastWeek: 2.5, lastYear: 3.1 },
        visitorComplaintRate: { current: 0.8 * factor, lastWeek: 0.9, lastYear: 1.2 },
        rideTurnoverRate: { current: 3.6 / factor, lastWeek: 3.5, lastYear: 3.2 },
        avgWaitTime: { current: 32 * factor, lastWeek: 34, lastYear: 38 },
        totalVisitors: { current: Math.round(168500 / factor), lastWeek: 162300, lastYear: 145800 },
      },
      recommendations: i === 0 ? [
        '建议加强冒险岛区域游乐设备维保频率，该区域故障率高于园区平均35%',
        '优化恐龙大逃亡项目排队区设置，增加遮阳棚和互动显示屏',
        '周末高峰时段增加餐饮区临时服务人员，提升翻台率',
        '快速通道票建议引入动态定价，高峰时段适当提价调控需求',
      ] : [
        '持续关注设备振动监测数据，预防性维护可降低40%故障停机',
        '优化员工排班，高峰时段增加一线运营人员配比',
      ],
    });
  }
  return reports;
}

export const mockUsers: User[] = [
  { id: 'user-1', name: '孙总', role: 'gm', roleName: '园区总经理', avatar: '👨‍💼' },
  { id: 'user-2', name: '刘洋', role: 'director', roleName: '运营总监', avatar: '👨‍💻' },
  { id: 'user-3', name: '陈静', role: 'zone_manager', roleName: '冒险岛区域经理', zoneIds: ['zone-2'], avatar: '👩‍💼' },
  { id: 'user-4', name: '王芳', role: 'supervisor', roleName: '运营主管', zoneIds: ['zone-2'], rideIds: ['ride-1', 'ride-8', 'ride-9', 'ride-17'], avatar: '👩‍💻' },
  { id: 'user-5', name: '李明', role: 'maintenance', roleName: '维修班组组长', avatar: '🧑‍🔧' },
];

export const mockGlobalMetrics: GlobalMetrics = {
  totalVisitors: 20230,
  totalVisitorsYesterday: 18650,
  avgWaitTime: 38,
  avgWaitTimeYesterday: 34,
  equipmentAvailability: 96.8,
  equipmentAvailabilityYesterday: 97.2,
  restaurantTurnover: 3.2,
  restaurantTurnoverYesterday: 3.0,
  satisfactionScore: 4.52,
  satisfactionScoreYesterday: 4.48,
  activeAlerts: 6,
  criticalAlerts: 2,
};
