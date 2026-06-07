import { Router } from 'express';
import { db } from '../db/index.js';
import type { WeeklyReport } from '../../shared/types.js';

const reportsRouter = Router();

reportsRouter.get('/', (_req, res) => {
  try {
    const reports = [...db.weeklyReports].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
    res.json({ data: reports });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

reportsRouter.get('/:reportId', (req, res) => {
  try {
    const { reportId } = req.params;
    const report = db.weeklyReports.find((r) => r.id === reportId);
    if (!report) {
      res.status(404).json({ error: '报告不存在' });
      return;
    }
    res.json({ data: report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

reportsRouter.post('/generate', (_req, res) => {
  try {
    const reports = [...db.weeklyReports].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
    const latest = reports[0];
    if (latest) {
      res.json({ data: latest });
    } else {
      res.status(404).json({ error: '没有可用的报告数据' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

reportsRouter.get('/:reportId/download', (req, res) => {
  try {
    const { reportId } = req.params;
    const report = db.weeklyReports.find((r) => r.id === reportId);
    if (!report) {
      res.status(404).json({ error: '报告不存在' });
      return;
    }

    const jsonData = JSON.stringify({ data: report }, null, 2);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=weekly-report-${reportId}.json`);
    res.send(jsonData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default reportsRouter;
