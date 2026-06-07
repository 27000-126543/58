import type {
  Zone,
  Ride,
  QueueRecord,
  GateRecord,
  RestaurantData,
  RestaurantOrder,
  VibrationReading,
  ShiftType,
  StaffShift,
  AlertType,
  AlertLevel,
  AlertStatus,
  Alert,
  ActionType,
  StepStatus,
  ApprovalFlow,
  ApprovalStep,
  ForecastData,
  StrategyType,
  PriorityType,
  StrategyRecommendation,
  WeeklyMetric,
  WeeklyReport,
  UserRole,
  User,
  GlobalMetrics,
  ZoneVisitor,
} from '../../shared/types';

export type {
  Zone,
  Ride,
  QueueRecord,
  GateRecord,
  RestaurantData,
  RestaurantOrder,
  VibrationReading,
  ShiftType,
  StaffShift,
  AlertType,
  AlertLevel,
  AlertStatus,
  Alert,
  ActionType,
  StepStatus,
  ApprovalFlow,
  ApprovalStep,
  ForecastData,
  StrategyType,
  PriorityType,
  StrategyRecommendation,
  WeeklyMetric,
  WeeklyReport,
  UserRole,
  User,
  GlobalMetrics,
  ZoneVisitor,
};

export interface DashboardMetrics {
  totalVisitors: number;
  currentHourVisitors: number;
  activeAlerts: number;
  avgWaitTime: number;
  avgSatisfaction: number;
  avgVibration: number;
  maintenanceRides: number;
}

export interface DashboardResponse extends DashboardMetrics {
  zones: Zone[];
  rides: Ride[];
  alerts: Alert[];
  topQueues: Ride[];
  restaurants: RestaurantData[];
}

export interface AlertDetailResponse {
  alert: Alert;
  approvalFlow: ApprovalFlow | null;
  approvalSteps: ApprovalStep[];
}

export interface ForecastRegenerateResponse {
  forecast: ForecastData[];
  strategies: StrategyRecommendation[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
