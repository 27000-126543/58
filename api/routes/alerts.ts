import { Router } from 'express';
import dayjs from 'dayjs';
import { db } from '../db/index.js';
import { eventBus } from '../engine/dataStream.js';
import { handleAlert as handleAlertEngine, resolveAlert as resolveAlertEngine, escalateAlert as escalateAlertEngine, approveStep, rejectStep } from '../engine/alertEngine.js';
import type { Alert, ApprovalFlow, ApprovalStep } from '../../shared/types.js';

const alertsRouter = Router();

alertsRouter.get('/', (req, res) => {
  try {
    const user = (req as any).user;
    const { level, status, type } = req.query;

    let alerts = [...db.alerts];

    if (level) {
      alerts = alerts.filter((a) => a.level === Number(level));
    }
    if (status) {
      alerts = alerts.filter((a) => a.status === status);
    }
    if (type) {
      alerts = alerts.filter((a) => a.type === type);
    }
    if (user?.role === 'zone_manager' && user.zoneIds) {
      alerts = alerts.filter((a) => user.zoneIds!.includes(a.zoneId));
    }
    if (user?.role === 'supervisor' && user.rideIds) {
      alerts = alerts.filter((a) => user.rideIds!.includes(a.rideId));
    }

    alerts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    res.json({ data: alerts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

alertsRouter.get('/:alertId', (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = db.alerts.find((a) => a.id === alertId);

    if (!alert) {
      res.status(404).json({ error: '预警不存在' });
      return;
    }

    let approvalFlow: ApprovalFlow | null = null;
    let approvalSteps: ApprovalStep[] = [];

    if (alert.status === 'escalated') {
      const flow = db.approvalFlows.find((f) => f.alertId === alertId);
      if (flow) {
        approvalFlow = flow;
        approvalSteps = db.approvalSteps
          .filter((s) => s.flowId === flow.id)
          .sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      }
    }

    res.json({
      data: {
        alert,
        approvalFlow,
        approvalSteps,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

alertsRouter.post('/:alertId/handle', (req, res) => {
  try {
    const { alertId } = req.params;
    const { handler } = req.body;
    if (!handler) {
      res.status(400).json({ error: 'handler 是必需的' });
      return;
    }

    const alert = handleAlertEngine(alertId, handler);
    if (!alert) {
      res.status(404).json({ error: '预警不存在' });
      return;
    }

    eventBus.emit('alert:updated', alert);
    res.json({ data: alert });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

alertsRouter.post('/:alertId/resolve', (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = resolveAlertEngine(alertId);
    if (!alert) {
      res.status(404).json({ error: '预警不存在' });
      return;
    }

    eventBus.emit('alert:updated', alert);
    res.json({ data: alert });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

alertsRouter.post('/:alertId/escalate', (req, res) => {
  try {
    const { alertId } = req.params;
    const { actionType } = req.body;
    if (!actionType) {
      res.status(400).json({ error: 'actionType 是必需的' });
      return;
    }

    const alert = escalateAlertEngine(alertId, actionType);
    if (!alert) {
      res.status(404).json({ error: '预警不存在' });
      return;
    }

    res.json({ data: alert });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

alertsRouter.post('/:alertId/approve-step', (req, res) => {
  try {
    const { alertId } = req.params;
    const { stepIndex, userId, userName, comment } = req.body;
    if (stepIndex === undefined || !userId || !userName) {
      res.status(400).json({ error: 'stepIndex, userId, userName 是必需的' });
      return;
    }

    const result = approveStep(alertId, stepIndex, userId, userName, comment);
    if (!result) {
      res.status(400).json({ error: '审批失败，步骤不匹配或已被处理' });
      return;
    }

    const alert = db.alerts.find((a) => a.id === alertId);
    if (alert) {
      eventBus.emit('alert:updated', { ...alert });
    }

    res.json({ data: { ok: true } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

alertsRouter.post('/:alertId/reject-step', (req, res) => {
  try {
    const { alertId } = req.params;
    const { stepIndex, userId, userName, comment } = req.body;
    if (stepIndex === undefined || !userId || !userName) {
      res.status(400).json({ error: 'stepIndex, userId, userName 是必需的' });
      return;
    }

    const result = rejectStep(alertId, stepIndex, userId, userName, comment);
    if (!result) {
      res.status(400).json({ error: '驳回失败' });
      return;
    }

    const alert = db.alerts.find((a) => a.id === alertId);
    if (alert) {
      eventBus.emit('alert:updated', { ...alert });
    }

    res.json({ data: { ok: true } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default alertsRouter;
