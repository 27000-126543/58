// @ts-nocheck
/**
 * @deprecated DEPRECATED - 此文件已废弃
 *
 * 所有数据已迁移到后端 API，通过 src/store/appStore.ts 管理。
 * 此文件保留仅为兼容旧组件引用，请勿在新代码中使用。
 *
 * 数据获取方式：
 * - 用户数据: useAppStore(state => state.users) / fetchUsers()
 * - 看板数据: useAppStore(state => state.zones/rides/alerts/restaurants/globalMetrics) / fetchDashboard()
 * - 预警数据: useAppStore(state => state.alerts) / fetchAlerts()
 * - 预测数据: useAppStore(state => state.forecast/strategies) / fetchForecast()
 * - 报告数据: useAppStore(state => state.reports) / fetchReports()
 */

import type {
  Zone, Ride, Alert, QueueRecord, EquipmentFault, MaintenanceRecord,
  RestaurantData, StaffShift, ForecastData, StrategyRecommendation,
  WeeklyReport, User, GlobalMetrics
} from '@/types';
import { useAppStore } from '@/store/appStore';

function readStoreUsers(): User[] {
  try {
    return useAppStore.getState().users;
  } catch {
    return [];
  }
}

function readStoreZones(): Zone[] {
  try {
    return useAppStore.getState().zones;
  } catch {
    return [];
  }
}

function readStoreRides(): Ride[] {
  try {
    return useAppStore.getState().rides;
  } catch {
    return [];
  }
}

function readStoreAlerts(): Alert[] {
  try {
    return useAppStore.getState().alerts;
  } catch {
    return [];
  }
}

function readStoreRestaurants(): RestaurantData[] {
  try {
    return useAppStore.getState().restaurants;
  } catch {
    return [];
  }
}

function readStoreForecast(): ForecastData[] {
  try {
    return useAppStore.getState().forecast;
  } catch {
    return [];
  }
}

function readStoreStrategies(): StrategyRecommendation[] {
  try {
    return useAppStore.getState().strategies;
  } catch {
    return [];
  }
}

function readStoreReports(): WeeklyReport[] {
  try {
    return useAppStore.getState().reports;
  } catch {
    return [];
  }
}

function readStoreGlobalMetrics(): GlobalMetrics {
  try {
    return useAppStore.getState().globalMetrics || {
      totalVisitors: 0,
      totalVisitorsYesterday: 0,
      avgWaitTime: 0,
      avgWaitTimeYesterday: 0,
      equipmentAvailability: 0,
      equipmentAvailabilityYesterday: 0,
      restaurantTurnover: 0,
      restaurantTurnoverYesterday: 0,
      satisfactionScore: 0,
      satisfactionScoreYesterday: 0,
      activeAlerts: 0,
      criticalAlerts: 0,
    };
  } catch {
    return {
      totalVisitors: 0,
      totalVisitorsYesterday: 0,
      avgWaitTime: 0,
      avgWaitTimeYesterday: 0,
      equipmentAvailability: 0,
      equipmentAvailabilityYesterday: 0,
      restaurantTurnover: 0,
      restaurantTurnoverYesterday: 0,
      satisfactionScore: 0,
      satisfactionScoreYesterday: 0,
      activeAlerts: 0,
      criticalAlerts: 0,
    };
  }
}

export const mockZones: Zone[] = [];
export const mockRides: Ride[] = [];
export const mockAlerts: Alert[] = [];
export const mockQueueRecords: Record<string, QueueRecord[]> = {};
export const mockEquipmentFaults: EquipmentFault[] = [];
export const mockMaintenanceRecords: MaintenanceRecord[] = [];
export const mockRestaurants: RestaurantData[] = [];
export const mockStaffShifts: StaffShift[] = [];
export const mockStrategies: StrategyRecommendation[] = [];
export const mockUsers: User[] = [];

export function generateForecastData(): ForecastData[] {
  return readStoreForecast();
}

export function generateWeeklyReports(): WeeklyReport[] {
  return readStoreReports();
}

export const mockGlobalMetrics: GlobalMetrics = {
  totalVisitors: 0,
  totalVisitorsYesterday: 0,
  avgWaitTime: 0,
  avgWaitTimeYesterday: 0,
  equipmentAvailability: 0,
  equipmentAvailabilityYesterday: 0,
  restaurantTurnover: 0,
  restaurantTurnoverYesterday: 0,
  satisfactionScore: 0,
  satisfactionScoreYesterday: 0,
  activeAlerts: 0,
  criticalAlerts: 0,
};

export function getLiveZones(): Zone[] { return readStoreZones(); }
export function getLiveRides(): Ride[] { return readStoreRides(); }
export function getLiveAlerts(): Alert[] { return readStoreAlerts(); }
export function getLiveRestaurants(): RestaurantData[] { return readStoreRestaurants(); }
export function getLiveUsers(): User[] { return readStoreUsers(); }
export function getLiveGlobalMetrics(): GlobalMetrics { return readStoreGlobalMetrics(); }
export function getLiveForecast(): ForecastData[] { return readStoreForecast(); }
export function getLiveStrategies(): StrategyRecommendation[] { return readStoreStrategies(); }
export function getLiveWeeklyReports(): WeeklyReport[] { return readStoreReports(); }
