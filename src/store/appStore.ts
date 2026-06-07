import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Alert,
  GlobalMetrics,
  Zone,
  Ride,
  ForecastData,
  StrategyRecommendation,
  WeeklyReport,
  ActionType,
  ApprovalFlow,
  ApprovalStep,
} from '@shared/types';
import { apiClient } from '@/api/client';

type ExtendedAlert = Alert & {
  approvalFlow?: ApprovalFlow & { steps: ApprovalStep[] };
};

interface LoadingState {
  dashboard: boolean;
  alerts: boolean;
  forecast: boolean;
  reports: boolean;
}

interface AlertListParams {
  level?: number;
  status?: string;
  type?: string;
}

interface AppState {
  user: User | null;
  users: User[];
  zones: Zone[];
  rides: Ride[];
  alerts: ExtendedAlert[];
  globalMetrics: GlobalMetrics | null;
  forecast: ForecastData[];
  strategies: StrategyRecommendation[];
  reports: WeeklyReport[];
  selectedDate: string;
  wsConnected: boolean;
  loading: LoadingState;
  error: string | null;

  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUsers: () => Promise<User[]>;
  fetchDashboard: () => Promise<void>;
  fetchAlerts: (params?: AlertListParams) => Promise<void>;
  fetchForecast: () => Promise<void>;
  fetchReports: () => Promise<void>;
  handleAlert: (alertId: string, handler: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  escalateAlert: (alertId: string, actionType: ActionType) => Promise<void>;
  approveStep: (alertId: string, stepIndex: number, comment?: string) => Promise<void>;
  rejectStep: (alertId: string, stepIndex: number, comment?: string) => Promise<void>;
  adoptStrategy: (id: string) => Promise<void>;
  regenerateForecast: () => Promise<void>;
  uploadWeather: (file: File) => Promise<void>;
  uploadEvent: (file: File) => Promise<void>;
  generate: () => Promise<WeeklyReport | null>;
  setSelectedDate: (date: string) => void;
  setWsConnected: (connected: boolean) => void;
  setZones: (zones: Zone[]) => void;
  setRides: (rides: Ride[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setGlobalMetrics: (metrics: GlobalMetrics) => void;
  upsertAlert: (alert: Alert) => void;
  updateZone: (zone: Partial<Zone> & { id: string }) => void;
  updateRide: (ride: Partial<Ride> & { id: string }) => void;
  filterByPermission: <T extends { zoneId?: string; id?: string }>(items: T[]) => T[];
  setError: (error: string | null) => void;
}

async function uploadFile(path: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  const userId = localStorage.getItem('tp_user_id');
  const headers: Record<string, string> = {};
  if (userId) headers['X-User-Id'] = userId;
  const url = `/api${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, { method: 'POST', body: formData, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`上传失败 (${res.status}) ${text}`);
  }
}

type DashboardResponse = {
  zones: Zone[];
  rides: Ride[];
  alerts: Alert[];
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      zones: [],
      rides: [],
      alerts: [],
      globalMetrics: null,
      forecast: [],
      strategies: [],
      reports: [],
      selectedDate: new Date().toISOString().split('T')[0],
      wsConnected: false,
      loading: { dashboard: false, alerts: false, forecast: false, reports: false },
      error: null,

      login: async (userId: string) => {
        try {
          const user = await apiClient.post<User>('/login', { userId });
          localStorage.setItem('tp_user', JSON.stringify(user));
          localStorage.setItem('tp_user_id', user.id);
          set({ user, error: null });
          void get().fetchDashboard();
        } catch (err: any) {
          set({ error: err.message || '登录失败' });
          throw err;
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/logout');
        } catch {
        }
        localStorage.removeItem('tp_user');
        localStorage.removeItem('tp_user_id');
        set({
          user: null,
          zones: [],
          rides: [],
          alerts: [],
          globalMetrics: null,
          forecast: [],
          strategies: [],
          reports: [],
        });
      },

      fetchUsers: async () => {
        try {
          const users = await apiClient.get<User[]>('/users');
          set({ users, error: null });
          return users;
        } catch (err: any) {
          set({ error: err.message || '获取用户列表失败' });
          return [];
        }
      },

      fetchDashboard: async () => {
        set({ loading: { ...get().loading, dashboard: true } });
        try {
          const [dashboard, globalMetrics] = await Promise.all([
            apiClient.get<DashboardResponse>('/metrics/dashboard'),
            apiClient.get<GlobalMetrics>('/metrics/global'),
          ]);

          set({
            zones: dashboard.zones,
            rides: dashboard.rides,
            alerts: dashboard.alerts as ExtendedAlert[],
            globalMetrics,
            loading: { ...get().loading, dashboard: false },
            error: null,
          });
        } catch (err: any) {
          set({
            loading: { ...get().loading, dashboard: false },
            error: err.message || '获取看板数据失败',
          });
        }
      },

      fetchAlerts: async (params?: AlertListParams) => {
        set({ loading: { ...get().loading, alerts: true } });
        try {
          const alerts = await apiClient.get<Alert[]>('/alerts', params as any);
          set({ alerts: alerts as ExtendedAlert[], loading: { ...get().loading, alerts: false }, error: null });
        } catch (err: any) {
          set({ loading: { ...get().loading, alerts: false }, error: err.message || '获取预警列表失败' });
        }
      },

      fetchForecast: async () => {
        set({ loading: { ...get().loading, forecast: true } });
        try {
          const [forecast, strategies] = await Promise.all([
            apiClient.get<ForecastData[]>('/forecast'),
            apiClient.get<StrategyRecommendation[]>('/forecast/strategies'),
          ]);
          set({
            forecast,
            strategies,
            loading: { ...get().loading, forecast: false },
            error: null,
          });
        } catch (err: any) {
          set({ loading: { ...get().loading, forecast: false }, error: err.message || '获取预测数据失败' });
        }
      },

      fetchReports: async () => {
        set({ loading: { ...get().loading, reports: true } });
        try {
          const reports = await apiClient.get<WeeklyReport[]>('/reports');
          set({ reports, loading: { ...get().loading, reports: false }, error: null });
        } catch (err: any) {
          set({ loading: { ...get().loading, reports: false }, error: err.message || '获取报告列表失败' });
        }
      },

      handleAlert: async (alertId: string, handler: string) => {
        const prevAlerts = get().alerts;
        set({
          alerts: prevAlerts.map((a) =>
            a.id === alertId ? { ...a, status: 'processing', handledBy: handler } : a
          ),
        });
        try {
          await apiClient.post(`/alerts/${alertId}/handle`, { handler });
        } catch (err: any) {
          set({ alerts: prevAlerts, error: err.message || '处理预警失败' });
          throw err;
        }
      },

      resolveAlert: async (alertId: string) => {
        const prevAlerts = get().alerts;
        set({
          alerts: prevAlerts.map((a) =>
            a.id === alertId
              ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() }
              : a
          ),
        });
        try {
          await apiClient.post(`/alerts/${alertId}/resolve`);
        } catch (err: any) {
          set({ alerts: prevAlerts, error: err.message || '解除预警失败' });
          throw err;
        }
      },

      escalateAlert: async (alertId: string, actionType: ActionType) => {
        const prevAlerts = get().alerts;
        const actionTypeName = actionType === 'restrict_flow' ? '临时限流' : '加开快速通道';
        set({
          alerts: prevAlerts.map((a) => {
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
                  { role: 'zone_manager', roleName: '区域经理', status: 'pending', flowId: '' },
                  { role: 'director', roleName: '运营总监', status: 'pending', flowId: '' },
                  { role: 'gm', roleName: '园区总经理', status: 'pending', flowId: '' },
                ],
              },
            };
          }),
        });
        try {
          await apiClient.post(`/alerts/${alertId}/escalate`, { actionType });
        } catch (err: any) {
          set({ alerts: prevAlerts, error: err.message || '升级预警失败' });
          throw err;
        }
      },

      approveStep: async (alertId: string, stepIndex: number, comment?: string) => {
        const { user, alerts: prevAlerts } = get();
        if (!user) return;
        set({
          alerts: prevAlerts.map((a) => {
            if (a.id !== alertId || !a.approvalFlow) return a;
            const steps = [...a.approvalFlow.steps];
            steps[stepIndex] = {
              ...steps[stepIndex],
              status: 'approved',
              userId: user.id,
              userName: user.name,
              comment,
              approvedAt: new Date().toISOString(),
            };
            return {
              ...a,
              approvalFlow: {
                ...a.approvalFlow,
                steps,
                currentStep: Math.min(stepIndex + 1, steps.length),
              },
            };
          }),
        });
        try {
          await apiClient.post(`/alerts/${alertId}/approve-step`, {
            stepIndex,
            userId: user.id,
            userName: user.name,
            comment,
          });
        } catch (err: any) {
          set({ alerts: prevAlerts, error: err.message || '审批失败' });
          throw err;
        }
      },

      rejectStep: async (alertId: string, stepIndex: number, comment?: string) => {
        const { user, alerts: prevAlerts } = get();
        if (!user) return;
        set({
          alerts: prevAlerts.map((a) => {
            if (a.id !== alertId || !a.approvalFlow) return a;
            const steps = [...a.approvalFlow.steps];
            steps[stepIndex] = {
              ...steps[stepIndex],
              status: 'rejected',
              userId: user.id,
              userName: user.name,
              comment,
              approvedAt: new Date().toISOString(),
            };
            return {
              ...a,
              approvalFlow: {
                ...a.approvalFlow,
                steps,
              },
            };
          }),
        });
        try {
          await apiClient.post(`/alerts/${alertId}/reject-step`, {
            stepIndex,
            userId: user.id,
            userName: user.name,
            comment,
          });
        } catch (err: any) {
          set({ alerts: prevAlerts, error: err.message || '驳回失败' });
          throw err;
        }
      },

      adoptStrategy: async (id: string) => {
        const prevStrategies = get().strategies;
        set({
          strategies: prevStrategies.map((s) =>
            s.id === id ? { ...s, adopted: true, adoptedAt: new Date().toISOString() } : s
          ),
        });
        try {
          await apiClient.post(`/forecast/strategies/${id}/adopt`);
        } catch (err: any) {
          set({ strategies: prevStrategies, error: err.message || '采纳策略失败' });
          throw err;
        }
      },

      regenerateForecast: async () => {
        set({ loading: { ...get().loading, forecast: true } });
        try {
          const result = await apiClient.post<{
            forecast: ForecastData[];
            strategies: StrategyRecommendation[];
          }>('/forecast/regenerate');
          set({
            forecast: result.forecast,
            strategies: result.strategies,
            loading: { ...get().loading, forecast: false },
            error: null,
          });
        } catch (err: any) {
          set({ loading: { ...get().loading, forecast: false }, error: err.message || '重新生成预测失败' });
        }
      },

      uploadWeather: async (file: File) => {
        await uploadFile('/forecast/upload-weather', file);
        await get().fetchForecast();
      },

      uploadEvent: async (file: File) => {
        await uploadFile('/forecast/upload-event', file);
        await get().fetchForecast();
      },

      generate: async () => {
        try {
          const report = await apiClient.post<WeeklyReport>('/reports/generate');
          await get().fetchReports();
          return report;
        } catch (err: any) {
          set({ error: err.message || '生成报告失败' });
          return null;
        }
      },

      setSelectedDate: (date: string) => set({ selectedDate: date }),

      setWsConnected: (connected: boolean) => set({ wsConnected: connected }),

      setZones: (zones: Zone[]) => set({ zones }),
      setRides: (rides: Ride[]) => set({ rides }),
      setAlerts: (alerts: Alert[]) => set({ alerts: alerts as ExtendedAlert[] }),
      setGlobalMetrics: (metrics: GlobalMetrics) => set({ globalMetrics: metrics }),

      upsertAlert: (alert: Alert) => {
        const existing = get().alerts.find((a) => a.id === alert.id);
        if (existing) {
          set({
            alerts: get().alerts.map((a) =>
              a.id === alert.id ? { ...a, ...alert } : a
            ),
          });
        } else {
          set({ alerts: [alert as ExtendedAlert, ...get().alerts] });
        }
      },

      updateZone: (zone: Partial<Zone> & { id: string }) => {
        set({
          zones: get().zones.map((z) => (z.id === zone.id ? { ...z, ...zone } : z)),
        });
      },

      updateRide: (ride: Partial<Ride> & { id: string }) => {
        set({
          rides: get().rides.map((r) => (r.id === ride.id ? { ...r, ...ride } : r)),
        });
      },

      filterByPermission: <T extends { zoneId?: string; id?: string }>(items: T[]): T[] => {
        const user = get().user;
        if (!user) return [];
        if (user.role === 'gm' || user.role === 'director') return items;
        if (user.rideIds && user.rideIds.length > 0) {
          return items.filter((item) => user.rideIds?.includes(item.id || ''));
        }
        if (user.zoneIds && user.zoneIds.length > 0) {
          return items.filter((item) => user.zoneIds?.includes(item.zoneId || ''));
        }
        return items;
      },

      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'tp_app_store_v3',
      partialize: (state) => ({
        user: state.user,
        selectedDate: state.selectedDate,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const stored = localStorage.getItem('tp_user');
          if (stored && !state.user) {
            try {
              const parsedUser = JSON.parse(stored) as User;
              state.user = parsedUser;
              localStorage.setItem('tp_user_id', parsedUser.id);
            } catch {
            }
          }
          if (state.user) {
            setTimeout(() => {
              void state.fetchDashboard();
            }, 0);
          }
        }
      },
    }
  )
);

export default useAppStore;
