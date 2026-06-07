import { EventEmitter } from 'events';
import dayjs from 'dayjs';
import { db } from '../db/index.js';
import type { GlobalMetrics, Ride } from '../../shared/types.js';

export const eventBus = new EventEmitter();
eventBus.setMaxListeners(100);

export let globalMetrics: GlobalMetrics = {
  totalVisitors: 0,
  totalVisitorsYesterday: 0,
  avgWaitTime: 0,
  avgWaitTimeYesterday: 0,
  equipmentAvailability: 0,
  equipmentAvailabilityYesterday: 0,
  restaurantTurnover: 0,
  restaurantTurnoverYesterday: 0,
  satisfactionScore: 0,
  satisfactionScoreYesterday: 0,
  activeAlerts: 0,
  criticalAlerts: 0,
};

const FAULT_RIDE_IDS = ['ride-5', 'ride-3'];

function getTimeSlotFactor(): number {
  const hour = dayjs().hour();
  if (hour >= 11 && hour <= 14) return 1.8;
  if (hour >= 16 && hour <= 19) return 1.5;
  if (hour >= 9 && hour < 11) return 1.0;
  if (hour >= 14 && hour < 16) return 0.9;
  if (hour >= 19 && hour <= 21) return 0.6;
  return 0.3;
}

function getRunningRides(): Ride[] {
  return db.rides.filter((r) => r.status !== 'maintenance');
}

function slidingAverage(values: number[], windowSize: number = 3): number {
  if (values.length === 0) return 0;
  const recent = values.slice(-windowSize);
  return recent.reduce((a, b) => a + b, 0) / recent.length;
}

function medianFilter(values: number[], windowSize: number = 3): number {
  if (values.length === 0) return 0;
  const recent = values.slice(-windowSize).sort((a, b) => a - b);
  const mid = Math.floor(recent.length / 2);
  return recent.length % 2 !== 0 ? recent[mid] : (recent[mid - 1] + recent[mid]) / 2;
}

let qrCounter = 100000;
let grCounter = 100000;
let vrCounter = 100000;
let roCounter = 100000;

function generateQueueData(): void {
  const rides = getRunningRides();
  const timeFactor = getTimeSlotFactor();
  const now = dayjs().toISOString();

  for (const ride of rides) {
    const recentRecords = db.queueRecords
      .filter((q) => q.rideId === ride.id)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 10);

    const recentWaits = recentRecords.map((r) => r.waitTime);
    const base = recentWaits.length > 0
      ? slidingAverage(recentWaits, 5)
      : ride.avgWaitTime;

    const randomFactor = 0.8 + Math.random() * 0.4;
    let rawWaitTime = Math.round(base * timeFactor * randomFactor);

    if (rawWaitTime < 0) rawWaitTime = 0;
    if (rawWaitTime > 240) rawWaitTime = 240;

    const allWaits = [...recentWaits, rawWaitTime];
    const smoothed = Math.round(slidingAverage(allWaits, 3));

    db.queueRecords.push({
      id: `qr-${qrCounter++}`,
      rideId: ride.id,
      timestamp: now,
      waitTime: smoothed,
    });

    ride.currentWaitTime = smoothed;

    eventBus.emit('new:queueRecord', {
      rideId: ride.id,
      rideName: ride.name,
      timestamp: now,
      waitTime: smoothed,
    });
  }
}

function generateGateData(): void {
  if (db.zones.length === 0) return;

  const now = dayjs().toISOString();
  const randomZone = db.zones[Math.floor(Math.random() * db.zones.length)];
  const isIn = Math.random() > 0.45;
  const hour = dayjs().hour();

  let baseCount: number;
  if (hour >= 9 && hour < 12) baseCount = isIn ? 40 : 10;
  else if (hour >= 12 && hour < 15) baseCount = isIn ? 25 : 20;
  else if (hour >= 15 && hour < 19) baseCount = isIn ? 20 : 35;
  else if (hour >= 19 && hour <= 21) baseCount = isIn ? 10 : 30;
  else baseCount = isIn ? 3 : 5;

  const count = Math.max(1, Math.round(baseCount * (0.7 + Math.random() * 0.6)));
  const type: 'in' | 'out' = isIn ? 'in' : 'out';

  db.gateRecords.push({
    id: `gr-${grCounter++}`,
    timestamp: now,
    zoneId: randomZone.id,
    type,
    count,
    entries: type === 'in' ? count : 0,
    exits: type === 'out' ? count : 0,
  });

  if (type === 'in') {
    randomZone.visitorCount = Math.min(randomZone.capacity, randomZone.visitorCount + count);
  } else {
    randomZone.visitorCount = Math.max(0, randomZone.visitorCount - count);
  }
  randomZone.heatLevel = Math.min(100, Math.round((randomZone.visitorCount / randomZone.capacity) * 100));

  if (dayjs().minute() === 0) {
    db.zoneVisitors.push({
      id: `zv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      zoneId: randomZone.id,
      timestamp: now,
      hour: dayjs(now).format('HH:mm'),
      visitorCount: randomZone.visitorCount,
    });
  }

  eventBus.emit('new:gateRecord', {
    zoneId: randomZone.id,
    zoneName: randomZone.name,
    timestamp: now,
    type,
    count,
    visitorCount: randomZone.visitorCount,
    heatLevel: randomZone.heatLevel,
  });

  eventBus.emit('zone:updated', {
    id: randomZone.id,
    visitorCount: randomZone.visitorCount,
    heatLevel: randomZone.heatLevel,
  });
}

function generateVibrationData(): void {
  const rides = getRunningRides();
  const now = dayjs().toISOString();

  for (const ride of rides) {
    const recentReadings = db.vibrationReadings
      .filter((v) => v.rideId === ride.id)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 10);
    const recentLevels = recentReadings.map((r) => r.overallLevel);

    const isFaultRide = FAULT_RIDE_IDS.includes(ride.id);
    const anomalyChance = isFaultRide ? 0.15 : 0.03;
    const hasAnomaly = Math.random() < anomalyChance;

    let x: number, y: number, z: number, overall: number;

    if (hasAnomaly) {
      const threshold = ride.vibrationThreshold;
      const anomalyMultiplier = 1.2 + Math.random() * 1.5;
      const baseHigh = threshold * anomalyMultiplier;
      x = +(baseHigh * (0.8 + Math.random() * 0.4)).toFixed(2);
      y = +(baseHigh * (0.8 + Math.random() * 0.4)).toFixed(2);
      z = +(baseHigh * (0.8 + Math.random() * 0.4)).toFixed(2);
    } else {
      x = +(0.2 + Math.random() * 2.3).toFixed(2);
      y = +(0.2 + Math.random() * 2.3).toFixed(2);
      z = +(0.2 + Math.random() * 2.3).toFixed(2);
    }

    overall = +(Math.sqrt(x * x + y * y + z * z)).toFixed(2);

    const allLevels = [...recentLevels, overall];
    const filtered = +medianFilter(allLevels, 3).toFixed(2);

    db.vibrationReadings.push({
      id: `vr-${vrCounter++}`,
      rideId: ride.id,
      timestamp: now,
      xAxis: x,
      yAxis: y,
      zAxis: z,
      overallLevel: filtered,
    });

    ride.vibrationLevel = filtered;

    eventBus.emit('new:vibrationReading', {
      rideId: ride.id,
      rideName: ride.name,
      timestamp: now,
      xAxis: x,
      yAxis: y,
      zAxis: z,
      overallLevel: filtered,
      threshold: ride.vibrationThreshold,
      isAnomaly: hasAnomaly,
    });

    eventBus.emit('ride:updated', {
      id: ride.id,
      vibrationLevel: filtered,
    });
  }
}

function generateRestaurantOrderData(): void {
  if (db.restaurants.length === 0) return;

  const restaurant = db.restaurants[Math.floor(Math.random() * db.restaurants.length)];
  const now = dayjs().toISOString();
  const hour = dayjs().hour();

  const isPeakHour = (hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 19);
  const guestCount = 1 + Math.floor(Math.random() * (isPeakHour ? 8 : 5));
  const avgPerPerson = 35 + Math.random() * 50;
  const amount = Math.round(guestCount * avgPerPerson * 100) / 100;
  const tableNumber = 1 + Math.floor(Math.random() * Math.max(1, Math.floor(restaurant.capacity * 0.4)));

  db.restaurantOrders.push({
    id: `ro-${roCounter++}`,
    restaurantId: restaurant.id,
    timestamp: now,
    amount,
    guestCount,
    tableNumber,
  });

  const startOfToday = dayjs().startOf('day').valueOf();
  const todayOrders = db.restaurantOrders.filter((o) => {
    if (o.restaurantId !== restaurant.id) return false;
    return dayjs(o.timestamp).valueOf() >= startOfToday;
  });

  const todaySales = todayOrders.reduce((sum, o) => sum + o.amount, 0);
  const turnoverRate = todayOrders.length > 0 ? +((todayOrders.length / Math.max(1, restaurant.capacity * 0.4)) * (hour >= 10 ? (hour - 9) / 4 : 1)).toFixed(2) : 0;
  const avgWaitTime = isPeakHour ? 12 + Math.floor(Math.random() * 15) : 3 + Math.floor(Math.random() * 10);

  restaurant.todaySales = Math.round(todaySales);
  restaurant.avgWaitTime = avgWaitTime;
  restaurant.turnoverRate = Math.min(10, turnoverRate);

  eventBus.emit('new:restaurantOrder', {
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    timestamp: now,
    amount,
    guestCount,
    todaySales: Math.round(todaySales),
    turnoverRate: Math.min(10, turnoverRate),
  });
}

export function aggregateGlobalMetrics(): GlobalMetrics {
  const rides = db.rides;
  const zones = db.zones;
  const restaurants = db.restaurants;
  const alerts = db.alerts.filter((a) => a.status === 'active' || a.status === 'processing' || a.status === 'escalated');

  const runningRides = rides.filter((r) => r.status !== 'maintenance');
  const avgWaitTime = runningRides.length > 0
    ? Math.round(runningRides.reduce((sum, r) => sum + r.currentWaitTime, 0) / runningRides.length)
    : 0;

  const equipmentAvailability = rides.length > 0
    ? +((runningRides.length / rides.length) * 100).toFixed(1)
    : 0;

  const totalVisitors = zones.reduce((sum, z) => sum + z.visitorCount, 0);

  const restaurantTurnover = restaurants.length > 0
    ? +(restaurants.reduce((sum, r) => sum + r.turnoverRate, 0) / restaurants.length).toFixed(2)
    : 0;

  const totalCapacity = runningRides.reduce((sum, r) => sum + r.capacity, 0);
  const satisfactionScore = totalCapacity > 0
    ? +(runningRides.reduce((sum, r) => sum + r.satisfaction * r.capacity, 0) / totalCapacity).toFixed(2)
    : 0;

  const activeAlerts = alerts.length;
  const criticalAlerts = alerts.filter((a) => a.level === 2).length;

  globalMetrics = {
    totalVisitors,
    totalVisitorsYesterday: Math.round(totalVisitors * (0.9 + Math.random() * 0.2)),
    avgWaitTime,
    avgWaitTimeYesterday: Math.round(avgWaitTime * (0.9 + Math.random() * 0.2)),
    equipmentAvailability,
    equipmentAvailabilityYesterday: +(equipmentAvailability * (0.98 + Math.random() * 0.03)).toFixed(1),
    restaurantTurnover,
    restaurantTurnoverYesterday: +(restaurantTurnover * (0.9 + Math.random() * 0.2)).toFixed(2),
    satisfactionScore,
    satisfactionScoreYesterday: +(satisfactionScore * (0.98 + Math.random() * 0.03)).toFixed(2),
    activeAlerts,
    criticalAlerts,
  };

  eventBus.emit('metrics:update', globalMetrics);
  return globalMetrics;
}

export function startDataStream(): () => void {
  const queueInterval = setInterval(generateQueueData, 30000);
  const gateInterval = setInterval(generateGateData, 15000);
  const vibrationInterval = setInterval(generateVibrationData, 10000);
  const restaurantInterval = setInterval(generateRestaurantOrderData, 20000);
  const metricsInterval = setInterval(aggregateGlobalMetrics, 60000);

  generateQueueData();
  generateGateData();
  generateVibrationData();
  generateRestaurantOrderData();
  aggregateGlobalMetrics();

  return function stop(): void {
    clearInterval(queueInterval);
    clearInterval(gateInterval);
    clearInterval(vibrationInterval);
    clearInterval(restaurantInterval);
    clearInterval(metricsInterval);
  };
}

export default { startDataStream, eventBus, globalMetrics, aggregateGlobalMetrics };
