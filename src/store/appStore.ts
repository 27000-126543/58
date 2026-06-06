import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User, Alert, GlobalMetrics, Zone, Ride, QueueRecord, EquipmentFault,
  MaintenanceRecord, RestaurantData, StaffShift, ForecastData,
  StrategyRecommendation, WeeklyReport, ApprovalStep, ActionType
} from '@/types';
import {
  mockUsers, mockAlerts, mockGlobalMetrics, mockZones, mockRides,
  mockQueueRecords, mockEquipmentFaults, mockMaintenanceRecords,
  mockRestaurants, mockStaffShifts, generateForecastData, mockStrategies,
  generateWeeklyReports
} from '@/data/mockData';

interface AppState {
  currentUser: User | null;
  selectedDate: string;
  globalMetrics: GlobalMetrics;
  zones: Zone[];
  rides: Ride[];
  alerts: Alert[];
  queueRecords: Record<string, QueueRecord[]>;
  equipmentFaults: EquipmentFault[];
  maintenanceRecords: MaintenanceRecord[];
  restaurants: RestaurantData[];
  staffShifts: StaffShift[];
  forecastData: ForecastData[];
  strategies: StrategyRecommendation[];
  weeklyReports: WeeklyReport[];
  login: (userId: string) => void;
  logout: () => void;
  setSelectedDate: (date: string) => void;
  handleAlert: (alertId: string, handler: string) => void;
  resolveAlert: (alertId: string) => void;
  escalateAlert: (alertId: string, actionType: ActionType) => void;
  approveStep: (alertId: string, stepIndex: number, userId: string, userName: string, comment?: string) => void;
  rejectStep: (alertId: string, stepIndex: number, userId: string, userName: string, comment?: string) => void;
  filterByPermission: <T extends { zoneId?: string; id?: string }>(items: T[]) => T[];
  regenerateForecast: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: mockUsers[0],
      selectedDate: new Date().toISOString().split('T')[0],
      globalMetrics: mockGlobalMetrics,
      zones: mockZones,
      rides: mockRides,
      alerts: mockAlerts,
      queueRecords: mockQueueRecords,
      equipmentFaults: mockEquipmentFaults,
      maintenanceRecords: mockMaintenanceRecords,
      restaurants: mockRestaurants,
      staffShifts: mockStaffShifts,
      forecastData: generateForecastData(),
      strategies: mockStrategies,
      weeklyReports: generateWeeklyReports(),

      login: (userId: string) => {
        const user = mockUsers.find(u => u.id === userId);
        if (user) set({ currentUser: user });
      },
      logout: () => set({ currentUser: null }),
      setSelectedDate: (date: string) => set({ selectedDate: date }),

      handleAlert: (alertId: string, handler: string) => {
        set(state => ({
          alerts: state.alerts.map(a =>
            a.id === alertId ? { ...a, status: 'processing', handledBy: handler } : a
          )
        }));
      },
      resolveAlert: (alertId: string) => {
        set(state => ({
          alerts: state.alerts.map(a =>
            a.id === alertId
              ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() }
              : a
          )
        }));
      },
      escalateAlert: (alertId: string, actionType: ActionType) => {
        const actionTypeName = actionType === 'restrict_flow' ? '临时限流' : '加开快速通道';
        set(state => ({
          alerts: state.alerts.map(a => {
            if (a.id !== alertId) return a;
            return {
              ...a,
              level: 2,
              status: 'escalated',
              escalatedAt: new Date().toISOString(),
              approvalFlow: {
                id: `flow-${Date.now()}`,
                alertId,
                currentStep: 0,
                actionType,
                actionTypeName,
                steps: [
                  { role: 'zone_manager', roleName: '区域经理', status: 'pending' },
                  { role: 'director', roleName: '运营总监', status: 'pending' },
                  { role: 'gm', roleName: '园区总经理', status: 'pending' },
                ]
              }
            };
          })
        }));
      },
      approveStep: (alertId: string, stepIndex: number, userId: string, userName: string, comment?: string) => {
        set(state => ({
          alerts: state.alerts.map(a => {
            if (a.id !== alertId || !a.approvalFlow) return a;
            const steps = [...a.approvalFlow.steps];
            steps[stepIndex] = {
              ...steps[stepIndex],
              status: 'approved',
              userId,
              userName,
              comment,
              approvedAt: new Date().toISOString(),
            };
            return {
              ...a,
              approvalFlow: {
                ...a.approvalFlow,
                steps,
                currentStep: Math.min(stepIndex + 1, steps.length),
              }
            };
          })
        }));
      },
      rejectStep: (alertId: string, stepIndex: number, userId: string, userName: string, comment?: string) => {
        set(state => ({
          alerts: state.alerts.map(a => {
            if (a.id !== alertId || !a.approvalFlow) return a;
            const steps = [...a.approvalFlow.steps];
            steps[stepIndex] = {
              ...steps[stepIndex],
              status: 'rejected',
              userId,
              userName,
              comment,
              approvedAt: new Date().toISOString(),
            };
            return {
              ...a,
              approvalFlow: {
                ...a.approvalFlow,
                steps,
              }
            };
          })
        }));
      },
      filterByPermission: <T extends { zoneId?: string; id?: string }>(items: T[]): T[] => {
        const user = get().currentUser;
        if (!user) return [];
        if (user.role === 'gm' || user.role === 'director') return items;
        if (user.rideIds && user.rideIds.length > 0) {
          return items.filter(item => user.rideIds?.includes(item.id || ''));
        }
        if (user.zoneIds && user.zoneIds.length > 0) {
          return items.filter(item => user.zoneIds?.includes(item.zoneId || ''));
        }
        return items;
      },
      regenerateForecast: () => {
        set({ forecastData: generateForecastData() });
      },
    }),
    {
      name: 'theme-park-app-store',
      partialize: (state) => ({ currentUser: state.currentUser, selectedDate: state.selectedDate }),
    }
  )
);
