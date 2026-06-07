import { Router } from 'express';
import dayjs from 'dayjs';
import { db } from '../db/index.js';
import { filterByZone } from '../utils/permissions.js';
import type { Zone, GateRecord, ZoneVisitor } from '../../shared/types.js';

const zonesRouter = Router();

zonesRouter.get('/', (req, res) => {
  try {
    const user = (req as any).user;
    const zones = filterByZone(user, db.zones, (z) => z.id, (z) => z.id);
    res.json({ data: zones });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

zonesRouter.get('/:zoneId', (req, res) => {
  try {
    const { zoneId } = req.params;
    const user = (req as any).user;
    const zone = db.zones.find((z) => z.id === zoneId);
    if (!zone) {
      res.status(404).json({ error: '区域不存在' });
      return;
    }
    const filtered = filterByZone(user, [zone], (z) => z.id, (z) => z.id);
    if (filtered.length === 0) {
      res.status(403).json({ error: '无权访问该区域' });
      return;
    }
    res.json({ data: filtered[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

zonesRouter.get('/:zoneId/gate-records', (req, res) => {
  try {
    const { zoneId } = req.params;
    const user = (req as any).user;
    const zone = db.zones.find((z) => z.id === zoneId);
    if (!zone) {
      res.status(404).json({ error: '区域不存在' });
      return;
    }
    const filtered = filterByZone(user, [zone], (z) => z.id, (z) => z.id);
    if (filtered.length === 0) {
      res.status(403).json({ error: '无权访问该区域' });
      return;
    }

    const { hours = '24' } = req.query;
    const hoursNum = parseInt(hours as string, 10);
    const since = dayjs().subtract(hoursNum, 'hour').toISOString();

    const records = db.gateRecords
      .filter((r) => r.zoneId === zoneId && r.timestamp >= since)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    res.json({ data: records });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

zonesRouter.get('/:zoneId/visitors', (req, res) => {
  try {
    const { zoneId } = req.params;
    const user = (req as any).user;
    const zone = db.zones.find((z) => z.id === zoneId);
    if (!zone) {
      res.status(404).json({ error: '区域不存在' });
      return;
    }
    const filtered = filterByZone(user, [zone], (z) => z.id, (z) => z.id);
    if (filtered.length === 0) {
      res.status(403).json({ error: '无权访问该区域' });
      return;
    }

    const visitors = db.zoneVisitors
      .filter((v) => v.zoneId === zoneId)
      .sort((a, b) => a.hour.localeCompare(b.hour));

    res.json({ data: visitors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default zonesRouter;
