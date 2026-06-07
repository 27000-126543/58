export interface Zone {
  id: string;
  name: string;
  visitorCount: number;
  capacity: number;
  heatLevel: number;
  color: string;
}

export interface Ride {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  currentWaitTime: number;
  avgWaitTime: number;
  capacity: number;
  availability: number;
  satisfaction: number;
  status: 'running' | 'normal' | 'warning' | 'maintenance';
  vibrationLevel: number;
  vibrationThreshold: number;
  todayRides: number;
  icon: string;
}

export interface QueueRecord {
  id?: string;
  rideId: string;
  timestamp: string;
  waitTime: number;
}

export interface GateRecord {
  id?: string;
  timestamp: string;
  zoneId: string;
  type: 'in' | 'out';
  count: number;
  entries: number;
  exits: number;
}

export interface RestaurantData {
  id: string;
  name: string;
  zoneId: string;
  turnoverRate: number;
  todaySales: number;
  avgWaitTime: number;
  capacity: number;
}

export interface RestaurantOrder {
  id?: string;
  restaurantId: string;
  timestamp: string;
  amount: number;
  guestCount: number;
  tableNumber: number;
}

export interface VibrationReading {
  id?: string;
  rideId: string;
  timestamp: string;
  xAxis: number;
  yAxis: number;
  zAxis: number;
  overallLevel: number;
}

export type ShiftType = 'morning' | 'afternoon' | 'evening';

export interface StaffShift {
  id: string;
  name: string;
  role: string;
  zoneId: string;
  shift: ShiftType;
  startTime: string;
  endTime: string;
}

export type AlertType = 'queue' | 'vibration';
export type AlertLevel = 1 | 2;
export type AlertStatus = 'active' | 'processing' | 'resolved' | 'escalated';

export interface Alert {
  id: string;
  type: AlertType;
  level: AlertLevel;
  rideId: string;
  rideName: string;
  zoneId: string;
  zoneName: string;
  message: string;
  createdAt: string;
  escalatedAt?: string;
  resolvedAt?: string;
  status: AlertStatus;
  handledBy?: string;
}

export type ActionType = 'restrict_flow' | 'fast_pass';
export type StepStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalFlow {
  id: string;
  alertId: string;
  currentStep: number;
  actionType: ActionType;
  actionTypeName: string;
}

export interface ApprovalStep {
  id?: string;
  flowId: string;
  role: string;
  roleName: string;
  userId?: string;
  userName?: string;
  status: StepStatus;
  comment?: string;
  approvedAt?: string;
}

export interface ForecastData {
  id?: string;
  timestamp: string;
  predictedVisitors: number;
  lowerBound: number;
  upperBound: number;
  historicalVisitors?: number;
}

export type StrategyType = 'extend_hours' | 'add_shows' | 'open_fast_pass' | 'add_staff';
export type PriorityType = 'high' | 'medium' | 'low';

export interface StrategyRecommendation {
  id: string;
  type: StrategyType;
  title: string;
  description: string;
  expectedImpact: string;
  confidence: number;
  priority: PriorityType;
  adopted?: boolean;
  adoptedAt?: string;
  createdAt?: string;
}

export interface WeeklyMetric {
  current: number;
  lastWeek: number;
  lastYear: number;
  woyChange: number;
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalVisitors: WeeklyMetric;
  avgWaitTime: WeeklyMetric;
  satisfaction: WeeklyMetric;
  restaurantRevenue: WeeklyMetric;
  rideAvailability: WeeklyMetric;
  recommendations: string[];
  generatedAt: string;
}

export type UserRole = 'gm' | 'director' | 'zone_manager' | 'supervisor' | 'maintenance';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  roleName: string;
  zoneIds?: string[];
  rideIds?: string[];
  avatar?: string;
}

export interface GlobalMetrics {
  totalVisitors: number;
  totalVisitorsYesterday: number;
  avgWaitTime: number;
  avgWaitTimeYesterday: number;
  equipmentAvailability: number;
  equipmentAvailabilityYesterday: number;
  restaurantTurnover: number;
  restaurantTurnoverYesterday: number;
  satisfactionScore: number;
  satisfactionScoreYesterday: number;
  activeAlerts: number;
  criticalAlerts: number;
}

export interface ZoneVisitor {
  id?: string;
  zoneId: string;
  timestamp: string;
  hour: string;
  visitorCount: number;
}
