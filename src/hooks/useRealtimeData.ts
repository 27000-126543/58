import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import type { Zone, Ride, Alert, GlobalMetrics } from '@shared/types';

interface WsMessage {
  type: string;
  payload: any;
  timestamp?: string;
}

export function useRealtimeData(): void {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setWsConnected = useAppStore((state) => state.setWsConnected);
  const setZones = useAppStore((state) => state.setZones);
  const setRides = useAppStore((state) => state.setRides);
  const setAlerts = useAppStore((state) => state.setAlerts);
  const setGlobalMetrics = useAppStore((state) => state.setGlobalMetrics);
  const upsertAlert = useAppStore((state) => state.upsertAlert);
  const updateZone = useAppStore((state) => state.updateZone);
  const updateRide = useAppStore((state) => state.updateRide);
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isActive = true;

    const handleMessage = (message: WsMessage) => {
      const { type, payload } = message;
      switch (type) {
        case 'init': {
          if (payload) {
            if (Array.isArray(payload.zones)) setZones(payload.zones as Zone[]);
            if (Array.isArray(payload.rides)) setRides(payload.rides as Ride[]);
            if (Array.isArray(payload.alerts)) setAlerts(payload.alerts as Alert[]);
          }
          break;
        }
        case 'zone:updated': {
          if (payload && payload.id) updateZone(payload as Partial<Zone> & { id: string });
          break;
        }
        case 'ride:updated': {
          if (payload && payload.id) updateRide(payload as Partial<Ride> & { id: string });
          break;
        }
        case 'new:alert':
        case 'alert:updated':
        case 'alert:escalated': {
          if (payload && payload.id) upsertAlert(payload as Alert);
          break;
        }
        case 'metrics:update': {
          if (payload) {
            const current = useAppStore.getState().globalMetrics;
            if (current) {
              setGlobalMetrics({ ...current, ...(payload as Partial<GlobalMetrics>) });
            } else {
              setGlobalMetrics(payload as GlobalMetrics);
            }
          }
          break;
        }
        case 'new:queueRecord': {
          if (payload && payload.rideId && typeof payload.waitTime === 'number') {
            updateRide({ id: payload.rideId, currentWaitTime: payload.waitTime });
          }
          break;
        }
        case 'new:vibrationReading': {
          if (payload && payload.rideId && typeof payload.overallLevel === 'number') {
            updateRide({ id: payload.rideId, vibrationLevel: payload.overallLevel });
          }
          break;
        }
        case 'new:gateRecord': {
          if (payload && payload.zoneId && typeof payload.entries === 'number') {
            const zones = useAppStore.getState().zones;
            const z = zones.find((x) => x.id === payload.zoneId);
            if (z) {
              const newCount = z.visitorCount + payload.entries;
              const newHeat = z.capacity > 0 ? Math.min(100, Math.round((newCount / z.capacity) * 100)) : z.heatLevel;
              updateZone({ id: z.id, visitorCount: newCount, heatLevel: newHeat });
            }
          }
          break;
        }
      }
    };

    const connect = () => {
      if (!isActive) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isActive) return;
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          if (!isActive) return;
          try {
            const message: WsMessage = JSON.parse(event.data);
            handleMessage(message);
          } catch {
          }
        };

        ws.onerror = () => {
          if (!isActive) return;
          setWsConnected(false);
        };

        ws.onclose = () => {
          if (!isActive) return;
          setWsConnected(false);
          if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
          }
          reconnectTimerRef.current = setTimeout(() => {
            if (isActive) {
              connect();
            }
          }, 3000);
        };
      } catch {
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
        }
        reconnectTimerRef.current = setTimeout(() => {
          if (isActive) {
            connect();
          }
        }, 3000);
      }
    };

    connect();

    return () => {
      isActive = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
        }
        wsRef.current = null;
      }
      setWsConnected(false);
    };
  }, [user, setWsConnected, setZones, setRides, setAlerts, setGlobalMetrics, upsertAlert, updateZone, updateRide]);
}

export default useRealtimeData;
