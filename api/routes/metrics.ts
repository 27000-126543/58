import { Router } from 'express';
import dayjs from 'dayjs';
import { db } from '../db/index.js';
import { aggregateGlobalMetrics } from '../engine/dataStream.js';
import { filterByZone } from '../utils/permissions.js';
import type { GlobalMetrics } from '../../shared/types.js';

const metricsRouter = Router();

metricsRouter.get('/global', (_req, res) => {
  try {
    const metrics = aggregateGlobalMetrics();
    res.json({ data: metrics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

metricsRouter.get('/dashboard', (req, res) => {
  try {
    const user = (req as any).user;
    const allRides = filterByZone(user, db.rides, (r) => r.id, (r) => r.zoneId);
    const allZones = filterByZone(user, db.zones, (z) => z.id, (z) => z.id);
    const allAlerts = db.alerts.filter((a) => {
      if (user?.role === 'gm' || user?.role === 'director') return true;
      if (user?.role === 'zone_manager' || user?.role === 'supervisor') {
        return a.zoneId === user.zoneId;
      }
      return true;
    });

    const now = dayjs();
    const todayStart = now.startOf('day').toISOString();
    const hourStart = now.startOf('hour').toISOString();

    const totalVisitors = db.gateRecords
      .filter((r) => r.timestamp >= todayStart)
      .reduce((sum, r) => sum + r.entries, 0);

    const currentHourVisitors = db.gateRecords
      .filter((r) => r.timestamp >= hourStart)
      .reduce((sum, r) => sum + r.entries, 0);

    const activeAlerts = allAlerts.filter((a) => a.status === 'active' || a.status === 'processing' || a.status === 'escalated');

    const avgWaitTime = allRides.length > 0
      ? Math.round(allRides.reduce((sum, r) => sum + r.currentWaitTime, 0) / allRides.length)
      : 0;

    const avgSatisfaction = allRides.length > 0
      ? Math.round(allRides.reduce((sum, r) => sum + r.satisfaction, 0) / allRides.length * 10) / 10
      : 0;

    const avgVibration = allRides.length > 0
      ? Math.round(allRides.reduce((sum, r) => sum + r.vibrationLevel, 0) / allRides.length * 100) / 100
      : 0;

    const maintenanceRides = allRides.filter((r) => r.status === 'maintenance');

    const recentAlerts = [...allAlerts]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10);

    const topQueues = [...allRides]
      .sort((a, b) => b.currentWaitTime - a.currentWaitTime)
      .slice(0, 5);

    const restaurants = db.restaurants;

    res.json({
      data: {
        totalVisitors,
        currentHourVisitors,
        activeAlerts: activeAlerts.length,
        avgWaitTime,
        avgSatisfaction,
        avgVibration,
        maintenanceRides: maintenanceRides.length,
        zones: allZones,
        rides: allRides,
        alerts: recentAlerts,
        topQueues,
        restaurants,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default metricsRouter;
