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
  status: 'normal' | 'warning' | 'maintenance';
  vibrationLevel: number;
  vibrationThreshold: number;
  todayRides: number;
  icon: string;
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
  approvalFlow?: ApprovalFlow;
  handledBy?: string;
}

export type ActionType = 'restrict_flow' | 'fast_pass';
export type StepStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalStep {
  role: string;
  roleName: string;
  userId?: string;
  userName?: string;
  status: StepStatus;
  comment?: string;
  approvedAt?: string;
}

export interface ApprovalFlow {
  id: string;
  alertId: string;
  steps: ApprovalStep[];
  currentStep: number;
  actionType: ActionType;
  actionTypeName: string;
}

export interface QueueRecord {
  timestamp: string;
  waitTime: number;
  rideId: string;
}

export type FaultSeverity = 'low' | 'medium' | 'high';

export interface EquipmentFault {
  id: string;
  rideId: string;
  type: string;
  description: string;
  occurredAt: string;
  resolvedAt?: string;
  severity: FaultSeverity;
}

export interface MaintenanceRecord {
  id: string;
  rideId: string;
  type: string;
  description: string;
  technician: string;
  startedAt: string;
  completedAt: string;
  partsReplaced: string[];
  cost: number;
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

export interface ForecastData {
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
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  metrics: {
    equipmentFaultRate: { current: number; lastWeek: number; lastYear: number };
    visitorComplaintRate: { current: number; lastWeek: number; lastYear: number };
    rideTurnoverRate: { current: number; lastWeek: number; lastYear: number };
    avgWaitTime: { current: number; lastWeek: number; lastYear: number };
    totalVisitors: { current: number; lastWeek: number; lastYear: number };
  };
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
