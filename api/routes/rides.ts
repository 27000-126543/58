import { Router } from 'express';
import dayjs from 'dayjs';
import { db } from '../db/index.js';
import { filterByZone } from '../utils/permissions.js';
import type { Ride, QueueRecord, VibrationReading } from '../../shared/types.js';

const ridesRouter = Router();

ridesRouter.get('/', (req, res) => {
  try {
    const user = (req as any).user;
    const { zoneId } = req.query;
    let rides = db.rides as Ride[];
    if (zoneId) {
      rides = rides.filter((r) => r.zoneId === zoneId);
    }
    rides = filterByZone(user, rides, (r) => r.id, (r) => r.zoneId);
    res.json({ data: rides });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ridesRouter.get('/:rideId', (req, res) => {
  try {
    const { rideId } = req.params;
    const user = (req as any).user;
    const ride = db.rides.find((r) => r.id === rideId);
    if (!ride) {
      res.status(404).json({ error: '项目不存在' });
      return;
    }
    const filtered = filterByZone(user, [ride], (r) => r.id, (r) => r.zoneId);
    if (filtered.length === 0) {
      res.status(403).json({ error: '无权访问该项目' });
      return;
    }
    res.json({ data: filtered[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ridesRouter.get('/:rideId/queue-records', (req, res) => {
  try {
    const { rideId } = req.params;
    const user = (req as any).user;
    const ride = db.rides.find((r) => r.id === rideId);
    if (!ride) {
      res.status(404).json({ error: '项目不存在' });
      return;
    }
    const filtered = filterByZone(user, [ride], (r) => r.id, (r) => r.zoneId);
    if (filtered.length === 0) {
      res.status(403).json({ error: '无权访问该项目' });
      return;
    }

    const { hours, days } = req.query;
    let since: string;
    if (days) {
      const daysNum = parseInt(days as string, 10);
      since = dayjs().subtract(daysNum, 'day').toISOString();
    } else {
      const hoursNum = hours ? parseInt(hours as string, 10) : 24;
      since = dayjs().subtract(hoursNum, 'hour').toISOString();
    }

    const records = db.queueRecords
      .filter((r) => r.rideId === rideId && r.timestamp >= since)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    res.json({ data: records });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ridesRouter.get('/:rideId/vibration-readings', (req, res) => {
  try {
    const { rideId } = req.params;
    const user = (req as any).user;
    const ride = db.rides.find((r) => r.id === rideId);
    if (!ride) {
      res.status(404).json({ error: '项目不存在' });
      return;
    }
    const filtered = filterByZone(user, [ride], (r) => r.id, (r) => r.zoneId);
    if (filtered.length === 0) {
      res.status(403).json({ error: '无权访问该项目' });
      return;
    }

    const { hours = '24' } = req.query;
    const hoursNum = parseInt(hours as string, 10);
    const since = dayjs().subtract(hoursNum, 'hour').toISOString();

    const readings = db.vibrationReadings
      .filter((v) => v.rideId === rideId && v.timestamp >= since)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    res.json({ data: readings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ridesRouter.get('/:rideId/faults', (req, res) => {
  try {
    const { rideId } = req.params;
    const user = (req as any).user;
    const ride = db.rides.find((r) => r.id === rideId);
    if (!ride) {
      res.status(404).json({ error: '项目不存在' });
      return;
    }
    const filtered = filterByZone(user, [ride], (r) => r.id, (r) => r.zoneId);
    if (filtered.length === 0) {
      res.status(403).json({ error: '无权访问该项目' });
      return;
    }

    const threshold = ride.vibrationThreshold || 5.0;
    const readings = db.vibrationReadings
      .filter((v) => v.rideId === rideId && v.overallLevel > threshold)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    const faults: Array<{
      id: string;
      timestamp: string;
      overallLevel: number;
      threshold: number;
      xAxis: number;
      yAxis: number;
      zAxis: number;
      severity: 'warning' | 'critical';
    }> = [];

    let lastFaultTime = '';
    for (const reading of readings) {
      if (lastFaultTime && dayjs(reading.timestamp).isAfter(dayjs(lastFaultTime).subtract(5, 'minute'))) {
        continue;
      }
      const severity = reading.overallLevel > threshold * 1.5 ? 'critical' : 'warning';
      faults.push({
        id: `fault-${reading.id || reading.timestamp}`,
        timestamp: reading.timestamp,
        overallLevel: reading.overallLevel,
        threshold,
        xAxis: reading.xAxis,
        yAxis: reading.yAxis,
        zAxis: reading.zAxis,
        severity,
      });
      lastFaultTime = reading.timestamp;
    }

    res.json({ data: faults });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

ridesRouter.get('/:rideId/maintenance', (req, res) => {
  try {
    const { rideId } = req.params;
    const user = (req as any).user;
    const ride = db.rides.find((r) => r.id === rideId);
    if (!ride) {
      res.status(404).json({ error: '项目不存在' });
      return;
    }
    const filtered = filterByZone(user, [ride], (r) => r.id, (r) => r.zoneId);
    if (filtered.length === 0) {
      res.status(403).json({ error: '无权访问该项目' });
      return;
    }

    const records = db.alerts
      .filter((a) => a.rideId === rideId && (a.status === 'resolved' || a.type === 'vibration'))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((a) => ({
        id: `maint-${a.id}`,
        alertId: a.id,
        timestamp: a.createdAt,
        resolvedAt: a.resolvedAt,
        type: a.type,
        message: a.message,
        handledBy: a.handledBy,
      }));

    res.json({ data: records });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default ridesRouter;
