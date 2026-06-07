import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { db } from '../db/index.js';
import { eventBus } from '../engine/dataStream.js';

const clients = new Set<WebSocket>();

export function broadcast(type: string, payload: any): void {
  const message = JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString(),
  });

  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(message);
      } catch (e) {
      }
    }
  }
}

function getSnapshot() {
  const zones = db.zones.map((z) => ({
    id: z.id,
    name: z.name,
    visitorCount: z.visitorCount,
    capacity: z.capacity,
    heatLevel: z.heatLevel,
    color: z.color,
  }));

  const rides = db.rides.map((r) => ({
    id: r.id,
    name: r.name,
    zoneId: r.zoneId,
    zoneName: r.zoneName,
    currentWaitTime: r.currentWaitTime,
    avgWaitTime: r.avgWaitTime,
    capacity: r.capacity,
    availability: r.availability,
    satisfaction: r.satisfaction,
    status: r.status,
    vibrationLevel: r.vibrationLevel,
    vibrationThreshold: r.vibrationThreshold,
    todayRides: r.todayRides,
    icon: r.icon,
  }));

  const alerts = [...db.alerts]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((a) => ({
      id: a.id,
      type: a.type,
      level: a.level,
      rideId: a.rideId,
      rideName: a.rideName,
      zoneId: a.zoneId,
      zoneName: a.zoneName,
      message: a.message,
      createdAt: a.createdAt,
      escalatedAt: a.escalatedAt,
      resolvedAt: a.resolvedAt,
      status: a.status,
      handledBy: a.handledBy,
    }));

  return { zones, rides, alerts, messages: [] };
}

export function setupWebSocket(server: Server): void {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);

    try {
      ws.send(JSON.stringify({
        type: 'init',
        payload: getSnapshot(),
        timestamp: new Date().toISOString(),
      }));
    } catch (e) {
    }

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });
  });

  eventBus.on('new:queueRecord', (payload) => broadcast('new:queueRecord', payload));
  eventBus.on('new:vibrationReading', (payload) => broadcast('new:vibrationReading', payload));
  eventBus.on('metrics:update', (payload) => broadcast('metrics:update', payload));
  eventBus.on('new:alert', (payload) => broadcast('new:alert', payload));
  eventBus.on('alert:escalated', (payload) => broadcast('alert:escalated', payload));
  eventBus.on('alert:updated', (payload) => broadcast('alert:updated', payload));
  eventBus.on('zone:updated', (payload) => broadcast('zone:updated', payload));
  eventBus.on('ride:updated', (payload) => broadcast('ride:updated', payload));
  eventBus.on('new:gateRecord', (payload) => broadcast('new:gateRecord', payload));
  eventBus.on('new:restaurantOrder', (payload) => broadcast('new:restaurantOrder', payload));
}

export default setupWebSocket;
