import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { db } from '../db/index.js';
import { readExcelBuffer, safeParseNumber, safeParseDate } from '../utils/excel.js';
import type { ForecastData, StrategyRecommendation, PriorityType } from '../../shared/types.js';

export interface WeatherData {
  date: string;
  tempHigh: number;
  tempLow: number;
  precipitation: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'storm';
}

export interface EventData {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  expectedVisitors: number;
  zoneId?: string;
}

function normalizeCondition(raw: any): 'sunny' | 'cloudy' | 'rainy' | 'storm' {
  if (!raw) return 'sunny';
  const s = String(raw).toLowerCase();
  if (s.includes('暴') || s.includes('storm') || s.includes('雷')) return 'storm';
  if (s.includes('雨') || s.includes('rain')) return 'rainy';
  if (s.includes('阴') || s.includes('cloud') || s.includes('多')) return 'cloudy';
  return 'sunny';
}

export function parseWeatherExcel(buffer: Buffer): WeatherData[] {
  const rows = readExcelBuffer(buffer);
  if (rows.length < 2) return [];

  const header = rows[0].map((h: any) => String(h || '').trim());
  const colIdx = (name: string) => header.findIndex((h: string) => h.includes(name));

  const dateIdx = colIdx('日期') >= 0 ? colIdx('日期') : colIdx('Date');
  const highIdx = colIdx('最高温');
  const lowIdx = colIdx('最低温');
  const precipIdx = colIdx('降水');
  const condIdx = colIdx('天气');

  const rawData: Array<{ date: Date | null; high: number | null; low: number | null; precip: number | null; cond: string | null }> = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || !row.some((v: any) => v !== null && v !== '' && v !== undefined)) continue;

    rawData.push({
      date: dateIdx >= 0 ? safeParseDate(row[dateIdx]) : null,
      high: highIdx >= 0 ? safeParseNumber(row[highIdx], NaN) : null,
      low: lowIdx >= 0 ? safeParseNumber(row[lowIdx], NaN) : null,
      precip: precipIdx >= 0 ? safeParseNumber(row[precipIdx], NaN) : null,
      cond: condIdx >= 0 ? (row[condIdx] !== null && row[condIdx] !== undefined ? String(row[condIdx]) : null) : null,
    });
  }

  const validHighs = rawData.map(d => d.high).filter((v): v is number => typeof v === 'number' && !isNaN(v));
  const validLows = rawData.map(d => d.low).filter((v): v is number => typeof v === 'number' && !isNaN(v));
  const validPrecips = rawData.map(d => d.precip).filter((v): v is number => typeof v === 'number' && !isNaN(v));

  const meanHigh = validHighs.length > 0 ? validHighs.reduce((a, b) => a + b, 0) / validHighs.length : 25;
  const meanLow = validLows.length > 0 ? validLows.reduce((a, b) => a + b, 0) / validLows.length : 15;
  const meanPrecip = validPrecips.length > 0 ? validPrecips.reduce((a, b) => a + b, 0) / validPrecips.length : 0;

  const result: WeatherData[] = [];
  for (const d of rawData) {
    if (!d.date) continue;
    const dateStr = dayjs(d.date).format('YYYY-MM-DD');
    let high = typeof d.high === 'number' && !isNaN(d.high) ? d.high : meanHigh;
    let low = typeof d.low === 'number' && !isNaN(d.low) ? d.low : meanLow;
    if (high < low) [high, low] = [low, high];
    const precip = typeof d.precip === 'number' && !isNaN(d.precip) ? d.precip : meanPrecip;

    let condition = normalizeCondition(d.cond);
    if (d.cond === null) {
      if (precip > 20) condition = 'storm';
      else if (precip > 0.5) condition = 'rainy';
      else if (precip > 0) condition = 'rainy';
    }

    result.push({ date: dateStr, tempHigh: high, tempLow: low, precipitation: Math.max(0, precip), condition });
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

export function parseEventExcel(buffer: Buffer): EventData[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const rows: any[][] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as any[][];
    for (const r of sheetRows) rows.push(r);
  }
  if (rows.length < 2) return [];

  const header = rows[0].map((h: any) => String(h || '').trim());
  const colIdx = (name: string) => header.findIndex((h: string) => h.includes(name));

  const nameIdx = colIdx('活动名');
  const dateIdx = colIdx('日期');
  const startIdx = colIdx('开始');
  const endIdx = colIdx('结束');
  const visitorIdx = colIdx('引流') >= 0 ? colIdx('引流') : colIdx('预计');
  const zoneIdx = colIdx('区域');

  const result: EventData[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || !row.some((v: any) => v !== null && v !== '' && v !== undefined)) continue;

    const name = nameIdx >= 0 && row[nameIdx] ? String(row[nameIdx]).trim() : `活动${i}`;
    const date = dateIdx >= 0 ? safeParseDate(row[dateIdx]) : null;
    if (!date) continue;

    const parseTime = (val: any, def: string): string => {
      if (!val) return def;
      if (val instanceof Date) return dayjs(val).format('HH:mm');
      if (typeof val === 'number') {
        const totalMinutes = Math.round(val * 24 * 60);
        const h = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
      const s = String(val).trim();
      const match = s.match(/(\d{1,2})[:：](\d{2})/);
      if (match) {
        const h = Math.min(23, parseInt(match[1]));
        const m = Math.min(59, parseInt(match[2]));
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
      return def;
    };

    const startTime = parseTime(startIdx >= 0 ? row[startIdx] : null, '09:00');
    let endTime = parseTime(endIdx >= 0 ? row[endIdx] : null, '21:00');
    if (startTime >= endTime) endTime = '21:00';

    const expectedVisitors = visitorIdx >= 0 ? safeParseNumber(row[visitorIdx], 500) : 500;
    const zoneId = zoneIdx >= 0 && row[zoneIdx] ? String(row[zoneIdx]).trim() : undefined;

    result.push({
      name,
      date: dayjs(date).format('YYYY-MM-DD'),
      startTime,
      endTime,
      expectedVisitors: Math.max(0, expectedVisitors),
      zoneId,
    });
  }

  return result.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}

function getHistoricalBaseline(targetTime: dayjs.Dayjs): number {
  const targetDayOfWeek = targetTime.day();
  const targetHour = targetTime.hour();

  let totalVisitors = 0;
  let count = 0;

  for (let weekBack = 1; weekBack <= 4; weekBack++) {
    const targetDate = targetTime.subtract(weekBack, 'week');
    const dayStart = targetDate.startOf('day').valueOf();
    const dayEnd = targetDate.endOf('day').valueOf();

    const matchingRecords = db.gateRecords.filter(g => {
      if (g.type !== 'in') return false;
      const ts = dayjs(g.timestamp).valueOf();
      if (ts < dayStart || ts >= dayEnd) return false;
      return dayjs(g.timestamp).hour() === targetHour;
    });

    const sum = matchingRecords.reduce((s, g) => s + g.count, 0);
    if (matchingRecords.length > 0) {
      totalVisitors += sum;
      count++;
    }
  }

  const queueMatching = db.queueRecords.filter(q => {
    const t = dayjs(q.timestamp);
    return t.day() === targetDayOfWeek && t.hour() === targetHour;
  });

  const avgWait = queueMatching.length > 0
    ? queueMatching.reduce((s, q) => s + q.waitTime, 0) / queueMatching.length
    : 30;

  const baselineFromGate = count > 0 ? totalVisitors / count : 150;
  const baselineFromQueue = 100 + avgWait * 8;

  return Math.round((baselineFromGate + baselineFromQueue) / 2);
}

function getWeekFactor(dayjsObj: dayjs.Dayjs): number {
  const day = dayjsObj.day();
  if (day === 6 || day === 0) return 1.35;
  if (day === 5) return 1.15;
  return 1.0;
}

function getWeatherFactor(weather: WeatherData | undefined): number {
  if (!weather) return 1.0;

  let factor = 1.0;

  if (weather.tempHigh > 35 || weather.tempLow < 10) {
    factor *= 0.8;
  }

  switch (weather.condition) {
    case 'sunny': {
      const avgTemp = (weather.tempHigh + weather.tempLow) / 2;
      if (avgTemp >= 25 && avgTemp <= 35) factor *= 1.15;
      break;
    }
    case 'cloudy':
      factor *= 0.95;
      break;
    case 'rainy':
      if (weather.precipitation <= 5) factor *= 0.75;
      else factor *= 0.45;
      break;
    case 'storm':
      factor *= 0.45;
      break;
  }

  return factor;
}

function getTimeSlotFactor(hour: number): number {
  if (hour < 8 || hour >= 22) return 0.05;
  if (hour >= 8 && hour < 9) return 0.3;
  if (hour >= 9 && hour < 11) return 0.6 + (hour - 9) * 0.2;
  if (hour >= 11 && hour < 14) return 1.0;
  if (hour >= 14 && hour < 16) return 0.9;
  if (hour >= 16 && hour < 19) return 0.95;
  if (hour >= 19 && hour < 21) return 0.6;
  if (hour >= 21 && hour < 22) return 0.25;
  return 0.1;
}

function normalPdf(x: number, mean: number, std: number): number {
  const exp = -0.5 * Math.pow((x - mean) / std, 2);
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exp);
}

function getEventBoost(currentHour: number, events: EventData[], currentDateStr: string): number {
  let boost = 0;
  const todayEvents = events.filter(e => e.date === currentDateStr);

  for (const ev of todayEvents) {
    const [sh, sm] = ev.startTime.split(':').map(Number);
    const [eh, em] = ev.endTime.split(':').map(Number);
    const startHour = sh + sm / 60;
    const endHour = eh + em / 60;
    const midHour = (startHour + endHour) / 2;
    const duration = Math.max(1, endHour - startHour);
    const std = duration / 4;

    const weight = normalPdf(currentHour, midHour, std);
    const peakWeight = normalPdf(midHour, midHour, std);
    const normalizedWeight = peakWeight > 0 ? weight / peakWeight : 0;

    boost += ev.expectedVisitors * 0.15 * normalizedWeight;
  }

  return boost;
}

function generateStrategies(
  forecast: ForecastData[],
  events: EventData[]
): StrategyRecommendation[] {
  const strategies: StrategyRecommendation[] = [];

  const zones = db.zones;
  const rides = db.rides;

  const overCapacityZones: string[] = [];
  for (const zone of zones) {
    let consecutiveHigh = 0;
    for (let i = 0; i < forecast.length; i++) {
      const zoneShare = 1 / zones.length * 1.5;
      const zonePredicted = Math.round(forecast[i].predictedVisitors * zoneShare);
      if (zonePredicted > zone.capacity * 0.9) {
        consecutiveHigh++;
        if (consecutiveHigh > 2) {
          if (!overCapacityZones.includes(zone.id)) {
            overCapacityZones.push(zone.id);
            const exceedRatio = zonePredicted / zone.capacity;
            const confidence = Math.min(98, 70 + Math.round((exceedRatio - 0.9) * 100));
            strategies.push({
              id: `strat-staff-${zone.id}`,
              type: 'add_staff',
              title: `${zone.name}区域增加临时服务人员`,
              description: `预测${zone.name}区域客流高峰将超过容量90%，且持续超过2小时，需临时增加10名一线服务人员和3名安保人员`,
              expectedImpact: '提升区域接待能力约25%，降低拥挤踩踏风险',
              confidence,
              priority: 'high',
              adopted: false,
              createdAt: new Date().toISOString(),
            });
          }
          break;
        }
      } else {
        consecutiveHigh = 0;
      }
    }
  }

  for (const ride of rides) {
    const matchingQueues = db.queueRecords.filter(q => {
      if (q.rideId !== ride.id) return false;
      const h = dayjs(q.timestamp).hour();
      return h >= 11 && h <= 14;
    });

    const avgWait = matchingQueues.length > 0
      ? matchingQueues.reduce((s, q) => s + q.waitTime, 0) / matchingQueues.length
      : 0;

    if (avgWait > 70) {
      const confidence = Math.min(96, 65 + Math.round((avgWait - 70) * 1.5));
      strategies.push({
        id: `strat-fp-${ride.id}`,
        type: 'open_fast_pass',
        title: `${ride.name}项目加开快速通道`,
        description: `${ride.zoneName}${ride.name}高峰时段平均排队时间${Math.round(avgWait)}分钟，超过70分钟阈值，建议每小时开放60个快速通道名额`,
        expectedImpact: '平均等待时间降低约35%，游客满意度提升0.3分',
        confidence,
        priority: 'high',
        adopted: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  const latePeakForecast = forecast.filter(f => {
    const h = dayjs(f.timestamp).hour();
    return h >= 21 && h < 23;
  });
  const latePeakAvg = latePeakForecast.length > 0
    ? latePeakForecast.reduce((s, f) => s + f.predictedVisitors, 0) / latePeakForecast.length
    : 0;

  if (latePeakAvg > 800) {
    const confidence = Math.min(90, 60 + Math.round(latePeakAvg / 50));
    strategies.push({
      id: 'strat-extend-hours',
      type: 'extend_hours',
      title: '延长园区运营时间至22:30',
      description: `预测21:00后平均客流仍达${Math.round(latePeakAvg)}人，高峰持续超过常规闭园时间，建议延长运营1.5小时`,
      expectedImpact: '增加客流接待约8%，夜间营收提升约15万元',
      confidence,
      priority: 'medium',
      adopted: false,
      createdAt: new Date().toISOString(),
    });
  }

  const performanceEvents = events.filter(e =>
    e.name.includes('表演') || e.name.includes('演出') || e.name.includes('展示') || e.name.includes('秀')
  );
  for (const ev of performanceEvents) {
    const [sh, sm] = ev.startTime.split(':').map(Number);
    const [eh, em] = ev.endTime.split(':').map(Number);
    const startHour = sh + sm / 60;
    const endHour = eh + em / 60;

    let eventPeakVisitors = 0;
    for (const f of forecast) {
      const t = dayjs(f.timestamp);
      if (t.format('YYYY-MM-DD') === ev.date) {
        const h = t.hour() + t.minute() / 60;
        if (h >= startHour - 0.5 && h <= endHour + 0.5) {
          eventPeakVisitors = Math.max(eventPeakVisitors, f.predictedVisitors);
        }
      }
    }

    if (eventPeakVisitors > 2500) {
      const confidence = Math.min(88, 60 + Math.round(ev.expectedVisitors / 100));
      strategies.push({
        id: `strat-shows-${ev.name}`,
        type: 'add_shows',
        title: `《${ev.name}》增加场次`,
        description: `${ev.name}所在区域预测客流高峰达${eventPeakVisitors}人，当前场次预计无法满足需求，建议增加1场表演`,
        expectedImpact: '分流排队游客约400人次，提升区域体验',
        confidence,
        priority: 'medium',
        adopted: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return strategies.sort((a, b) => {
    const priorityOrder: Record<PriorityType, number> = { high: 0, medium: 1, low: 2 };
    const pa = priorityOrder[a.priority] ?? 99;
    const pb = priorityOrder[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    return b.confidence - a.confidence;
  });
}

export function runForecast(
  weatherData: WeatherData[],
  eventData: EventData[]
): { forecast: ForecastData[]; strategies: StrategyRecommendation[] } {
  const weatherMap: Record<string, WeatherData> = {};
  for (const w of weatherData) weatherMap[w.date] = w;

  const forecast: ForecastData[] = [];
  const now = dayjs().startOf('hour');

  for (let h = -6; h < 48; h++) {
    const targetTime = now.add(h, 'hour');
    const dateStr = targetTime.format('YYYY-MM-DD');
    const hourNum = targetTime.hour();

    const baseline = getHistoricalBaseline(targetTime);
    const weekFactor = getWeekFactor(targetTime);
    const weatherFactor = getWeatherFactor(weatherMap[dateStr]);
    const timeSlotFactor = getTimeSlotFactor(hourNum);
    const eventBoost = getEventBoost(hourNum + 0.5, eventData, dateStr);

    const predicted = Math.max(0, Math.round(baseline * weekFactor * weatherFactor * timeSlotFactor + eventBoost));
    const lowerBound = Math.max(0, Math.round(predicted * 0.82));
    const upperBound = Math.max(0, Math.round(predicted * 1.18));

    forecast.push({
      id: `fc-${targetTime.valueOf()}`,
      timestamp: targetTime.toISOString(),
      predictedVisitors: predicted,
      lowerBound,
      upperBound,
      historicalVisitors: undefined,
    });
  }

  const strategies = generateStrategies(forecast, eventData);

  return { forecast, strategies };
}

export function regenerateForecast(): { forecast: ForecastData[]; strategies: StrategyRecommendation[] } {
  const result = runForecast([], []);
  db.forecastData = result.forecast;
  db.strategies = result.strategies;
  return result;
}
