import { EventEmitter } from 'events';
import dayjs from 'dayjs';
import { db } from '../db/index.js';
import type { Alert, ApprovalFlow, ApprovalStep, ActionType } from '../../shared/types.js';

let alertCounter = 100000;
let flowCounter = 100000;
let stepCounter = 100000;

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hasActiveAlert(rideId: string, type: 'queue' | 'vibration'): Alert | null {
  const active = db.alerts
    .filter((a) => a.rideId === rideId && a.type === type)
    .filter((a) => a.status === 'active' || a.status === 'processing' || a.status === 'escalated')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return active.length > 0 ? active[0] : null;
}

function createAlert(
  type: 'queue' | 'vibration',
  ride: { id: string; name: string; zoneId: string; zoneName: string },
  message: string,
  eventBus: any
): Alert {
  const alertId = generateId('alert');
  const now = dayjs().toISOString();

  const alert: Alert = {
    id: alertId,
    type,
    level: 1,
    rideId: ride.id,
    rideName: ride.name,
    zoneId: ride.zoneId,
    zoneName: ride.zoneName,
    message,
    createdAt: now,
    status: 'active',
  };

  db.alerts.push(alert);
  eventBus.emit('new:alert', alert);
  return alert;
}

function createApprovalFlow(alertId: string, actionType: ActionType): void {
  const flowId = generateId('flow');
  const actionTypeName = actionType === 'fast_pass' ? '加开快速通道' : '限制客流';

  const flow: ApprovalFlow = {
    id: flowId,
    alertId,
    currentStep: 0,
    actionType,
    actionTypeName,
  };
  db.approvalFlows.push(flow);

  const steps = [
    { role: 'zone_manager', roleName: '区域经理' },
    { role: 'director', roleName: '运营总监' },
    { role: 'gm', roleName: '园区总经理' },
  ];

  for (const step of steps) {
    const approvalStep: ApprovalStep = {
      id: `step-${stepCounter++}`,
      flowId,
      role: step.role,
      roleName: step.roleName,
      status: 'pending',
    };
    db.approvalSteps.push(approvalStep);
  }
}

function checkQueueTimeouts(eventBus: any): void {
  const rides = db.rides.filter((r) => r.status !== 'maintenance');
  const thirtyMinutesAgo = dayjs().subtract(30, 'minute').toISOString();

  for (const ride of rides) {
    const records = db.queueRecords
      .filter((q) => q.rideId === ride.id && q.timestamp >= thirtyMinutesAgo)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    if (records.length < 6) continue;

    const allOver60 = records.every((r) => r.waitTime > 60);
    if (!allOver60) continue;

    const avgWait = Math.round(records.reduce((sum, r) => sum + r.waitTime, 0) / records.length);
    const existingAlert = hasActiveAlert(ride.id, 'queue');

    if (!existingAlert) {
      const message = `排队时长已连续30分钟超过60分钟，当前等待时间${ride.currentWaitTime}分钟`;
      createAlert('queue', ride, message, eventBus);
    } else {
      const alertAgeMinutes = dayjs().diff(dayjs(existingAlert.createdAt), 'minute');
      if (alertAgeMinutes > 60 && existingAlert.level === 1) {
        escalateAlertInternal(existingAlert, avgWait > 80 ? 'fast_pass' : 'restrict_flow', eventBus);
      }
    }
  }
}

function checkVibrationAnomalies(eventBus: any): void {
  const rides = db.rides.filter((r) => r.status !== 'maintenance');
  const fiveMinutesAgo = dayjs().subtract(5, 'minute').toISOString();

  for (const ride of rides) {
    const readings = db.vibrationReadings
      .filter((v) => v.rideId === ride.id && v.timestamp >= fiveMinutesAgo)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 5);

    if (readings.length < 3) continue;

    let consecutiveOver = 0;
    for (const reading of readings) {
      if (reading.overallLevel > ride.vibrationThreshold) {
        consecutiveOver++;
      } else {
        break;
      }
    }

    if (consecutiveOver < 3) continue;

    const latestReading = readings[0];
    const existingAlert = hasActiveAlert(ride.id, 'vibration');

    if (!existingAlert) {
      const message = `设备振动值达到${latestReading.overallLevel}mm/s，超过阈值${ride.vibrationThreshold}mm/s`;
      createAlert('vibration', ride, message, eventBus);
    } else {
      const alertAgeMinutes = dayjs().diff(dayjs(existingAlert.createdAt), 'minute');
      if (alertAgeMinutes > 60 && existingAlert.level === 1) {
        escalateAlertInternal(existingAlert, 'restrict_flow', eventBus);
      }
    }
  }
}

function escalateAlertInternal(alert: Alert, actionType: ActionType, eventBus: any): void {
  const now = dayjs().toISOString();
  const target = db.alerts.find((a) => a.id === alert.id);
  if (!target) return;

  target.level = 2;
  target.status = 'escalated';
  target.escalatedAt = now;

  createApprovalFlow(alert.id, actionType);

  const escalatedAlert: Alert = { ...target };
  eventBus.emit('alert:escalated', escalatedAlert);
  eventBus.emit('new:alert', escalatedAlert);
}

export function startAlertEngine(eventBus: any): () => void {
  const checkInterval = setInterval(() => {
    checkQueueTimeouts(eventBus);
    checkVibrationAnomalies(eventBus);
  }, 30000);

  checkQueueTimeouts(eventBus);
  checkVibrationAnomalies(eventBus);

  return function stop(): void {
    clearInterval(checkInterval);
  };
}

export function handleAlert(alertId: string, handler: string): Alert | null {
  const existing = db.alerts.find((a) => a.id === alertId);
  if (!existing) return null;

  existing.status = 'processing';
  existing.handledBy = handler;

  return { ...existing };
}

export function resolveAlert(alertId: string): Alert | null {
  const existing = db.alerts.find((a) => a.id === alertId);
  if (!existing) return null;

  existing.status = 'resolved';
  existing.resolvedAt = dayjs().toISOString();

  return { ...existing };
}

export function escalateAlert(alertId: string, actionType: ActionType): Alert | null {
  const existing = db.alerts.find((a) => a.id === alertId);
  if (!existing) return null;

  const localEventBus = (globalThis as any).__alertEventBus || new EventEmitter();
  escalateAlertInternal(existing, actionType, localEventBus);

  const updated = db.alerts.find((a) => a.id === alertId);
  return updated ? { ...updated } : null;
}

function getFlowByAlertId(alertId: string): { flow: ApprovalFlow; steps: ApprovalStep[] } | null {
  const flow = db.approvalFlows.find((f) => f.alertId === alertId);
  if (!flow) return null;

  const steps = db.approvalSteps
    .filter((s) => s.flowId === flow.id)
    .sort((a, b) => (a.id || '').localeCompare(b.id || ''));

  return { flow, steps };
}

export function approveStep(alertId: string, stepIndex: number, userId: string, userName: string, comment?: string): boolean {
  const data = getFlowByAlertId(alertId);
  if (!data) return false;

  const { flow, steps } = data;
  if (stepIndex < 0 || stepIndex >= steps.length) return false;
  if (stepIndex !== flow.currentStep) return false;

  const step = steps[stepIndex];
  const now = dayjs().toISOString();

  step.status = 'approved';
  step.userId = userId;
  step.userName = userName;
  step.comment = comment;
  step.approvedAt = now;

  if (stepIndex < steps.length - 1) {
    flow.currentStep = stepIndex + 1;
  }

  return true;
}

export function rejectStep(alertId: string, stepIndex: number, userId: string, userName: string, comment?: string): boolean {
  const data = getFlowByAlertId(alertId);
  if (!data) return false;

  const { steps } = data;
  if (stepIndex < 0 || stepIndex >= steps.length) return false;

  const step = steps[stepIndex];
  const now = dayjs().toISOString();

  step.status = 'rejected';
  step.userId = userId;
  step.userName = userName;
  step.comment = comment;
  step.approvedAt = now;

  return true;
}

export default {
  startAlertEngine,
  handleAlert,
  resolveAlert,
  escalateAlert,
  approveStep,
  rejectStep,
};
