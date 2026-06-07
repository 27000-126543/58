import dayjs from 'dayjs';
import { db, saveDatabase, type DatabaseSchema } from './database.js';
import type {
  Zone,
  Ride,
  QueueRecord,
  GateRecord,
  RestaurantData,
  RestaurantOrder,
  VibrationReading,
  StaffShift,
  Alert,
  ApprovalFlow,
  ApprovalStep,
  ForecastData,
  StrategyRecommendation,
  WeeklyReport,
  User,
  ZoneVisitor,
} from '../../shared/types.js';

const now = dayjs();

const zones: Zone[] = [
  { id: 'zone-1', name: '奇幻大道', visitorCount: 3820, capacity: 5000, heatLevel: 76, color: '#9B5DE5' },
  { id: 'zone-2', name: '冒险岛', visitorCount: 4210, capacity: 4500, heatLevel: 93, color: '#FF6B35' },
  { id: 'zone-3', name: '童话镇', visitorCount: 2890, capacity: 4000, heatLevel: 72, color: '#00D4AA' },
  { id: 'zone-4', name: '未来城', visitorCount: 3560, capacity: 4800, heatLevel: 74, color: '#316CC0' },
  { id: 'zone-5', name: '海洋王国', visitorCount: 3100, capacity: 4200, heatLevel: 74, color: '#00BBF9' },
  { id: 'zone-6', name: '恐龙谷', visitorCount: 2650, capacity: 3800, heatLevel: 70, color: '#70E000' },
];

const rides: Ride[] = [
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

const restaurants: RestaurantData[] = [
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

const staffShifts: StaffShift[] = [
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
  { id: 'staff-13', name: '钱进', role: '检票员', zoneId: 'zone-1', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-14', name: '孙悦', role: '检票员', zoneId: 'zone-2', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-15', name: '李娜', role: '检票员', zoneId: 'zone-3', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-16', name: '周涛', role: '服务员', zoneId: 'zone-1', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-17', name: '吴昊', role: '服务员', zoneId: 'zone-2', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-18', name: '郑洁', role: '服务员', zoneId: 'zone-5', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-19', name: '马超', role: '安全员', zoneId: 'zone-2', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-20', name: '林芳', role: '安全员', zoneId: 'zone-4', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-21', name: '黄磊', role: '维修技师', zoneId: 'zone-3', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-22', name: '徐明', role: '维修技师', zoneId: 'zone-2', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-23', name: '朱婷', role: '运营主管', zoneId: 'zone-6', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-24', name: '胡军', role: '区域经理', zoneId: 'zone-3', shift: 'morning', startTime: '08:30', endTime: '17:30' },
  { id: 'staff-25', name: '郭静', role: '区域经理', zoneId: 'zone-5', shift: 'afternoon', startTime: '12:00', endTime: '20:00' },
  { id: 'staff-26', name: '何伟', role: '区域经理', zoneId: 'zone-6', shift: 'morning', startTime: '08:30', endTime: '17:30' },
  { id: 'staff-27', name: '罗敏', role: '运营主管', zoneId: 'zone-4', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-28', name: '高飞', role: '维修技师', zoneId: 'zone-5', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-29', name: '梁宇', role: '维修技师', zoneId: 'zone-6', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-30', name: '宋佳', role: '检票员', zoneId: 'zone-4', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-31', name: '唐亮', role: '检票员', zoneId: 'zone-5', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-32', name: '韩雪', role: '检票员', zoneId: 'zone-6', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-33', name: '冯强', role: '服务员', zoneId: 'zone-3', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-34', name: '董丽', role: '服务员', zoneId: 'zone-4', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-35', name: '萧然', role: '服务员', zoneId: 'zone-6', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-36', name: '程鹏', role: '安全员', zoneId: 'zone-1', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-37', name: '曹颖', role: '安全员', zoneId: 'zone-3', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-38', name: '袁浩', role: '安全员', zoneId: 'zone-5', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-39', name: '邓萍', role: '安全员', zoneId: 'zone-6', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-40', name: '许阳', role: '维修技师', zoneId: 'zone-1', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-41', name: '傅磊', role: '维修主管', zoneId: 'zone-3', shift: 'morning', startTime: '07:30', endTime: '16:30' },
  { id: 'staff-42', name: '沈悦', role: '维修主管', zoneId: 'zone-5', shift: 'afternoon', startTime: '12:00', endTime: '20:00' },
  { id: 'staff-43', name: '曾辉', role: '运营主管', zoneId: 'zone-3', shift: 'morning', startTime: '08:00', endTime: '16:00' },
  { id: 'staff-44', name: '彭娟', role: '运营主管', zoneId: 'zone-5', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-45', name: '吕刚', role: '检票员', zoneId: 'zone-1', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-46', name: '苏琪', role: '检票员', zoneId: 'zone-2', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-47', name: '卢鑫', role: '服务员', zoneId: 'zone-2', shift: 'evening', startTime: '12:00', endTime: '20:00' },
  { id: 'staff-48', name: '蒋玲', role: '服务员', zoneId: 'zone-5', shift: 'evening', startTime: '12:00', endTime: '20:00' },
  { id: 'staff-49', name: '蔡峰', role: '区域经理', zoneId: 'zone-1', shift: 'afternoon', startTime: '12:00', endTime: '20:00' },
  { id: 'staff-50', name: '魏娜', role: '运营主管', zoneId: 'zone-2', shift: 'evening', startTime: '12:00', endTime: '20:00' },
  { id: 'staff-51', name: '田强', role: '维修技师', zoneId: 'zone-4', shift: 'afternoon', startTime: '14:00', endTime: '22:00' },
  { id: 'staff-52', name: '丁敏', role: '安全员', zoneId: 'zone-4', shift: 'morning', startTime: '08:00', endTime: '16:00' },
];

const users: User[] = [
  { id: 'user-1', name: '孙总', role: 'gm', roleName: '园区总经理', avatar: '👨‍💼' },
  { id: 'user-2', name: '刘洋', role: 'director', roleName: '运营总监', avatar: '👨‍💻' },
  { id: 'user-3', name: '陈静', role: 'zone_manager', roleName: '冒险岛区域经理', zoneIds: ['zone-2'], avatar: '👩‍💼' },
  { id: 'user-4', name: '郑华', role: 'zone_manager', roleName: '未来城区域经理', zoneIds: ['zone-4'], avatar: '👨‍💼' },
  { id: 'user-5', name: '王芳', role: 'supervisor', roleName: '冒险岛运营主管', zoneIds: ['zone-2'], rideIds: ['ride-1', 'ride-8', 'ride-9', 'ride-17'], avatar: '👩‍💻' },
  { id: 'user-6', name: '李明', role: 'maintenance', roleName: '维修班组组长', avatar: '🧑‍🔧' },
];

const alerts: Alert[] = [
  {
    id: 'alert-1', type: 'queue', level: 2, rideId: 'ride-5', rideName: '恐龙大逃亡', zoneId: 'zone-6', zoneName: '恐龙谷',
    message: '排队时长已连续75分钟超过60分钟，当前等待时间95分钟，已升级需审批',
    createdAt: now.subtract(75, 'minute').toISOString(),
    escalatedAt: now.subtract(45, 'minute').toISOString(),
    status: 'escalated',
  },
  {
    id: 'alert-2', type: 'vibration', level: 1, rideId: 'ride-3', rideName: '太空漫游', zoneId: 'zone-4', zoneName: '未来城',
    message: '设备振动值达到4.2mm/s，接近阈值5.0mm/s，需密切关注',
    createdAt: now.subtract(20, 'minute').toISOString(),
    status: 'active',
  },
  {
    id: 'alert-3', type: 'queue', level: 1, rideId: 'ride-1', rideName: '极速过山车', zoneId: 'zone-2', zoneName: '冒险岛',
    message: '排队时长已连续35分钟超过60分钟，当前等待时间85分钟',
    createdAt: now.subtract(35, 'minute').toISOString(),
    status: 'processing',
    handledBy: '王芳（运营主管）',
  },
  {
    id: 'alert-4', type: 'queue', level: 2, rideId: 'ride-9', rideName: '激流勇进', zoneId: 'zone-2', zoneName: '冒险岛',
    message: '排队时长持续高位，已完成三级审批，加开快速通道',
    createdAt: now.subtract(120, 'minute').toISOString(),
    escalatedAt: now.subtract(100, 'minute').toISOString(),
    resolvedAt: now.subtract(30, 'minute').toISOString(),
    status: 'resolved',
    handledBy: '孙总（园区总经理）',
  },
];

const approvalFlows: ApprovalFlow[] = [
  { id: 'flow-1', alertId: 'alert-1', currentStep: 1, actionType: 'fast_pass', actionTypeName: '加开快速通道' },
  { id: 'flow-2', alertId: 'alert-4', currentStep: 3, actionType: 'fast_pass', actionTypeName: '加开快速通道' },
];

const approvalSteps: ApprovalStep[] = [
  { flowId: 'flow-1', role: 'zone_manager', roleName: '区域经理', userId: 'user-7', userName: '何伟', status: 'approved', comment: '同意，客流高峰明显，恐龙谷客流已达容量92%', approvedAt: now.subtract(40, 'minute').toISOString() },
  { flowId: 'flow-1', role: 'director', roleName: '运营总监', status: 'pending' },
  { flowId: 'flow-1', role: 'gm', roleName: '园区总经理', status: 'pending' },
  { flowId: 'flow-2', role: 'zone_manager', roleName: '区域经理', userId: 'user-3', userName: '陈静', status: 'approved', comment: '同意，冒险岛客流超负载', approvedAt: now.subtract(95, 'minute').toISOString() },
  { flowId: 'flow-2', role: 'director', roleName: '运营总监', userId: 'user-2', userName: '刘洋', status: 'approved', comment: '同意，建议每小时开放60个名额', approvedAt: now.subtract(80, 'minute').toISOString() },
  { flowId: 'flow-2', role: 'gm', roleName: '园区总经理', userId: 'user-1', userName: '孙总', status: 'approved', comment: '批准执行，注意监控游客满意度', approvedAt: now.subtract(60, 'minute').toISOString() },
];

const strategies: StrategyRecommendation[] = [
  { id: 'strat-1', type: 'extend_hours', title: '延长冒险岛区域运营时间至22:30', description: '预测冒险岛客流高峰将持续至22:00后，建议延长运营1小时，预计可增加2500人次接待能力', expectedImpact: '增加客流接待约8%，营收提升约12万元', confidence: 92, priority: 'high', adopted: false, createdAt: now.subtract(2, 'hour').toISOString() },
  { id: 'strat-2', type: 'open_fast_pass', title: '恐龙大逃亡项目加开快速通道', description: '该项目排队时长持续高位，已触发二级预警，建议每小时开放50个快速通道名额', expectedImpact: '平均等待时间降低约35%，游客满意度提升0.3分', confidence: 88, priority: 'high', adopted: true, createdAt: now.subtract(3, 'hour').toISOString() },
  { id: 'strat-3', type: 'add_shows', title: '海豚湾表演增加16:30场次', description: '预测下午客流高峰，当前场次无法满足需求，建议增加一场表演', expectedImpact: '提升海洋王国区域分流能力，减少约400人次排队', confidence: 85, priority: 'medium', adopted: false, createdAt: now.subtract(4, 'hour').toISOString() },
  { id: 'strat-4', type: 'add_staff', title: '午餐时段增加餐饮区服务人员', description: '11:30-13:30为餐饮高峰，各餐厅翻台率压力大，建议临时增加15名服务人员', expectedImpact: '翻台率提升约20%，餐饮等待时间减少40%', confidence: 78, priority: 'medium', adopted: true, createdAt: now.subtract(5, 'hour').toISOString() },
  { id: 'strat-5', type: 'extend_hours', title: '4D影院延长夜场至21:30', description: '晚间未来城区域客流较高，影院利用率在夜间仍达75%以上', expectedImpact: '增加晚间游乐供给，提升夜间消费约5万元', confidence: 72, priority: 'low', adopted: false, createdAt: now.subtract(6, 'hour').toISOString() },
];

function generateQueueRecords(): QueueRecord[] {
  const records: QueueRecord[] = [];
  const baseWaits: Record<string, { base: number; variance: number }> = {
    'ride-1': { base: 50, variance: 25 }, 'ride-2': { base: 12, variance: 8 },
    'ride-3': { base: 45, variance: 20 }, 'ride-4': { base: 35, variance: 15 },
    'ride-5': { base: 68, variance: 30 }, 'ride-6': { base: 28, variance: 12 },
    'ride-7': { base: 20, variance: 10 }, 'ride-8': { base: 38, variance: 18 },
    'ride-9': { base: 55, variance: 22 }, 'ride-10': { base: 15, variance: 8 },
    'ride-11': { base: 40, variance: 18 }, 'ride-12': { base: 30, variance: 14 },
    'ride-13': { base: 18, variance: 8 }, 'ride-14': { base: 25, variance: 12 },
    'ride-15': { base: 10, variance: 5 }, 'ride-16': { base: 48, variance: 20 },
    'ride-17': { base: 35, variance: 15 }, 'ride-18': { base: 22, variance: 10 },
    'ride-19': { base: 38, variance: 16 }, 'ride-20': { base: 6, variance: 4 },
  };

  let idCounter = 1;
  for (const ride of rides) {
    const { base, variance } = baseWaits[ride.id];
    for (let d = 6; d >= 0; d--) {
      const dayDate = now.subtract(d, 'day');
      const dayOfWeek = dayDate.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      for (let h = 9; h <= 21; h++) {
        let hourFactor = 0.8;
        if (h >= 11 && h <= 14) hourFactor = 1.8;
        else if (h >= 16 && h <= 19) hourFactor = 1.5;
        const dayFactor = isWeekend ? 1.3 : 1.0;
        const randomFactor = 0.7 + Math.random() * 0.5;
        records.push({
          id: `qr-${idCounter++}`,
          rideId: ride.id,
          timestamp: dayDate.hour(h).minute(0).second(0).toISOString(),
          waitTime: Math.max(0, Math.round(base * hourFactor * dayFactor * randomFactor + (Math.random() - 0.5) * variance)),
        });
      }
    }
  }
  return records;
}

function generateGateRecords(): GateRecord[] {
  const records: GateRecord[] = [];
  let idCounter = 1;
  for (let h = 8; h <= 21; h++) {
    for (const zone of zones) {
      let baseIn = 60;
      if (h >= 9 && h <= 12) baseIn = 120;
      else if (h >= 13 && h <= 18) baseIn = 90;
      else if (h >= 19) baseIn = 40;

      let baseOut = 40;
      if (h >= 11 && h <= 14) baseOut = 30;
      else if (h >= 16 && h <= 20) baseOut = 110;

      const inCount = Math.round(baseIn * (0.7 + Math.random() * 0.6) * (zone.heatLevel / 80));
      const outCount = Math.round(baseOut * (0.7 + Math.random() * 0.6) * (zone.heatLevel / 80));
      records.push({
        id: `gr-${idCounter++}`,
        timestamp: now.hour(h).minute(0).second(0).toISOString(),
        zoneId: zone.id,
        type: 'in',
        count: inCount,
        entries: inCount,
        exits: 0,
      });
      records.push({
        id: `gr-${idCounter++}`,
        timestamp: now.hour(h).minute(0).second(0).toISOString(),
        zoneId: zone.id,
        type: 'out',
        count: outCount,
        entries: 0,
        exits: outCount,
      });
    }
  }
  return records;
}

function generateVibrationReadings(): VibrationReading[] {
  const records: VibrationReading[] = [];
  const abnormalRides = new Set(['ride-5', 'ride-3']);
  let idCounter = 1;

  for (const ride of rides) {
    if (ride.status === 'maintenance') continue;
    const baseLevel = ride.vibrationLevel || 1.0;
    const isAbnormal = abnormalRides.has(ride.id);

    for (let m = 0; m < 288; m++) {
      const time = now.subtract(m * 5, 'minute');
      let multiplier = 0.85 + Math.random() * 0.3;

      if (isAbnormal) {
        const anomalyRoll = Math.random();
        if (anomalyRoll < 0.08) {
          multiplier = 2.0 + Math.random() * 1.5;
        } else if (anomalyRoll < 0.2) {
          multiplier = 1.4 + Math.random() * 0.5;
        }
      } else {
        const anomalyRoll = Math.random();
        if (anomalyRoll < 0.02) {
          multiplier = 1.8 + Math.random() * 0.8;
        } else if (anomalyRoll < 0.05) {
          multiplier = 1.3 + Math.random() * 0.3;
        }
      }

      const x = +(baseLevel * multiplier * (0.8 + Math.random() * 0.4)).toFixed(2);
      const y = +(baseLevel * multiplier * (0.8 + Math.random() * 0.4)).toFixed(2);
      const z = +(baseLevel * multiplier * (0.8 + Math.random() * 0.4)).toFixed(2);
      const overall = +(Math.max(x, y, z)).toFixed(2);

      records.push({
        id: `vr-${idCounter++}`,
        rideId: ride.id,
        timestamp: time.toISOString(),
        xAxis: x,
        yAxis: y,
        zAxis: z,
        overallLevel: overall,
      });
    }
  }
  return records;
}

function generateRestaurantOrders(): RestaurantOrder[] {
  const records: RestaurantOrder[] = [];
  let idCounter = 1;

  for (const rest of restaurants) {
    const orderCount = 15 + Math.floor(Math.random() * 10);
    for (let i = 0; i < orderCount; i++) {
      const isLunch = Math.random() > 0.5;
      const peakHour = isLunch ? 11 + Math.floor(Math.random() * 3) : 17 + Math.floor(Math.random() * 3);
      const hour = Math.min(20, Math.max(10, peakHour + Math.floor((Math.random() - 0.5) * 3)));
      const minute = Math.floor(Math.random() * 60);
      const guestCount = 1 + Math.floor(Math.random() * 6);
      const avgPerPerson = 35 + Math.random() * 50;

      records.push({
        id: `ro-${idCounter++}`,
        restaurantId: rest.id,
        timestamp: now.hour(hour).minute(minute).second(0).toISOString(),
        amount: Math.round(guestCount * avgPerPerson * 100) / 100,
        guestCount,
        tableNumber: 1 + Math.floor(Math.random() * rest.capacity * 0.4),
      });
    }
  }
  return records.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function generateForecastData(): ForecastData[] {
  const data: ForecastData[] = [];
  const startOfHour = now.startOf('hour');
  let idCounter = 1;

  for (let h = -6; h < 48; h++) {
    const time = startOfHour.add(h, 'hour');
    const hour = time.hour();
    const dayOfWeek = time.day();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? 3500 : 2500;

    let hourFactor = 0.1;
    if (hour >= 9 && hour < 12) hourFactor = 0.7 + (hour - 9) * 0.1;
    else if (hour >= 12 && hour < 15) hourFactor = 1.0;
    else if (hour >= 15 && hour < 19) hourFactor = 0.9 + (hour - 15) * 0.05;
    else if (hour >= 19 && hour < 21) hourFactor = 0.6;

    const predicted = Math.round(base * hourFactor * (0.9 + Math.random() * 0.2));
    const historical = h < 0 ? Math.round(base * hourFactor * (0.85 + Math.random() * 0.3)) : undefined;

    data.push({
      id: `fd-${idCounter++}`,
      timestamp: time.toISOString(),
      predictedVisitors: predicted,
      lowerBound: Math.round(predicted * 0.8),
      upperBound: Math.round(predicted * 1.2),
      historicalVisitors: historical,
    });
  }
  return data;
}

function generateWeeklyReports(): WeeklyReport[] {
  const reports: WeeklyReport[] = [];

  for (let i = 0; i < 4; i++) {
    const weekEnd = now.subtract(i, 'week').endOf('week');
    const weekStart = weekEnd.startOf('week');
    const factor = 1 - i * 0.03;

    reports.push({
      id: `report-${i + 1}`,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      generatedAt: weekEnd.add(1, 'day').hour(8).toISOString(),
      totalVisitors: {
        current: Math.round(168500 / factor),
        lastWeek: 162300,
        lastYear: 145800,
        woyChange: +(((168500 / factor - 162300) / 162300) * 100).toFixed(1),
      },
      avgWaitTime: {
        current: Math.round(32 * factor),
        lastWeek: 34,
        lastYear: 38,
        woyChange: +(((32 * factor - 34) / 34) * 100).toFixed(1),
      },
      satisfaction: {
        current: +(4.5 * factor).toFixed(1),
        lastWeek: 4.4,
        lastYear: 4.2,
        woyChange: +(((4.5 * factor - 4.4) / 4.4) * 100).toFixed(1),
      },
      restaurantRevenue: {
        current: Math.round(856000 / factor),
        lastWeek: 823000,
        lastYear: 768000,
        woyChange: +(((856000 / factor - 823000) / 823000) * 100).toFixed(1),
      },
      rideAvailability: {
        current: +(96.5 * factor).toFixed(1),
        lastWeek: 95.8,
        lastYear: 94.2,
        woyChange: +(((96.5 * factor - 95.8) / 95.8) * 100).toFixed(1),
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

function generateZoneVisitors(): ZoneVisitor[] {
  const records: ZoneVisitor[] = [];
  let idCounter = 1;

  for (const zone of zones) {
    for (let h = 8; h <= 21; h++) {
      const time = now.hour(h).minute(0).second(0);
      let hourFactor = 0.5;
      if (h >= 10 && h < 13) hourFactor = 1.1;
      else if (h >= 14 && h < 18) hourFactor = 1.0;
      else if (h >= 18 && h < 20) hourFactor = 0.8;

      records.push({
        id: `zv-${idCounter++}`,
        zoneId: zone.id,
        timestamp: time.toISOString(),
        hour: time.format('HH:mm'),
        visitorCount: Math.round(zone.visitorCount * hourFactor * (0.9 + Math.random() * 0.2)),
      });
    }
  }
  return records;
}

export function seed(): void {
  const queueRecords = generateQueueRecords();
  const gateRecords = generateGateRecords();
  const vibrationReadings = generateVibrationReadings();
  const restaurantOrders = generateRestaurantOrders();
  const forecastData = generateForecastData();
  const weeklyReports = generateWeeklyReports();
  const zoneVisitors = generateZoneVisitors();

  const seeded: DatabaseSchema = {
    zones,
    rides,
    queueRecords,
    gateRecords,
    restaurants,
    restaurantOrders,
    vibrationReadings,
    staffShifts,
    alerts,
    approvalFlows,
    approvalSteps,
    forecastData,
    strategies,
    weeklyReports,
    users,
    zoneVisitors,
  };

  Object.assign(db, seeded);
  saveDatabase();

  console.log('种子数据初始化完成');
  console.log(`  - ${zones.length} 个区域`);
  console.log(`  - ${rides.length} 个游乐项目`);
  console.log(`  - ${restaurants.length} 个餐厅`);
  console.log(`  - ${queueRecords.length} 条排队记录`);
  console.log(`  - ${gateRecords.length} 条闸机记录`);
  console.log(`  - ${vibrationReadings.length} 条振动传感器读数`);
  console.log(`  - ${staffShifts.length} 条员工排班`);
  console.log(`  - ${users.length} 个用户`);
  console.log(`  - ${restaurantOrders.length} 条餐饮订单`);
  console.log(`  - ${alerts.length} 条预警`);
  console.log(`  - ${approvalFlows.length} 条审批流`);
  console.log(`  - ${forecastData.length} 条客流预测`);
  console.log(`  - ${strategies.length} 条策略推荐`);
  console.log(`  - ${weeklyReports.length} 份周报告`);
  console.log(`  - ${zoneVisitors.length} 条区域客流记录`);
}

export default seed;

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  seed();
}
