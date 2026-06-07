import type { Express } from 'express';
import authRouter from './auth.js';
import zonesRouter from './zones.js';
import ridesRouter from './rides.js';
import alertsRouter from './alerts.js';
import forecastRouter from './forecast.js';
import reportsRouter from './reports.js';
import metricsRouter from './metrics.js';

export function registerRoutes(app: Express): void {
  app.use('/api', authRouter);
  app.use('/api/zones', zonesRouter);
  app.use('/api/rides', ridesRouter);
  app.use('/api/alerts', alertsRouter);
  app.use('/api/forecast', forecastRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/metrics', metricsRouter);
}

export default registerRoutes;
