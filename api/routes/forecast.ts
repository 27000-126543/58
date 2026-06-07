import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db/index.js';
import { parseWeatherExcel, parseEventExcel, runForecast, regenerateForecast } from '../engine/forecastEngine.js';
import type { ForecastData, StrategyRecommendation } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const forecastRouter = Router();

forecastRouter.get('/', (_req, res) => {
  try {
    const data = [...db.forecastData].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

forecastRouter.get('/strategies', (_req, res) => {
  try {
    const strategies = [...db.strategies].sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    res.json({ data: strategies });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

forecastRouter.post('/upload-weather', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '未找到上传文件' });
      return;
    }
    const buffer = fs.readFileSync(req.file.path);
    const weatherData = parseWeatherExcel(buffer);

    try {
      fs.unlinkSync(req.file.path);
    } catch (_) {}

    (globalThis as any).__weatherData = weatherData;

    res.json({ data: weatherData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

forecastRouter.post('/upload-event', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '未找到上传文件' });
      return;
    }
    const buffer = fs.readFileSync(req.file.path);
    const eventData = parseEventExcel(buffer);

    try {
      fs.unlinkSync(req.file.path);
    } catch (_) {}

    (globalThis as any).__eventData = eventData;

    res.json({ data: eventData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

forecastRouter.post('/regenerate', (_req, res) => {
  try {
    const weatherData = (globalThis as any).__weatherData || [];
    const eventData = (globalThis as any).__eventData || [];

    const result = runForecast(weatherData, eventData);
    db.forecastData = result.forecast;
    db.strategies = result.strategies;

    res.json({
      data: {
        forecast: result.forecast,
        strategies: result.strategies,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

forecastRouter.post('/strategies/:id/adopt', (req, res) => {
  try {
    const { id } = req.params;
    const strategy = db.strategies.find((s) => s.id === id);
    if (!strategy) {
      res.status(404).json({ error: '策略不存在' });
      return;
    }

    strategy.adopted = true;
    strategy.adoptedAt = new Date().toISOString();

    res.json({ data: strategy });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default forecastRouter;
