import type { User } from '../../shared/types.js';
import { db } from '../db/index.js';

export function getCurrentUser(req: any): User | null {
  const userId = req.query.userId || req.headers['x-user-id'];
  if (!userId) return null;

  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  return user;
}

export function filterByUser<T extends { id: string; zoneId?: string; rideId?: string }>(
  items: T[],
  user: User | null,
  type: 'zone' | 'ride' | 'alert'
): T[] {
  if (!user) return items;
  if (user.role === 'gm' || user.role === 'director' || user.role === 'maintenance') {
    return items;
  }

  if (type === 'zone') {
    if (user.role === 'zone_manager' && user.zoneIds) {
      return items.filter(item => user.zoneIds!.includes(item.id));
    }
    if (user.role === 'supervisor') {
      return [];
    }
  }

  if (type === 'ride') {
    if (user.role === 'zone_manager' && user.zoneIds) {
      return items.filter(item => item.zoneId && user.zoneIds!.includes(item.zoneId));
    }
    if (user.role === 'supervisor' && user.rideIds) {
      return items.filter(item => user.rideIds!.includes(item.id));
    }
  }

  if (type === 'alert') {
    if (user.role === 'zone_manager' && user.zoneIds) {
      return items.filter(item => item.zoneId && user.zoneIds!.includes(item.zoneId));
    }
    if (user.role === 'supervisor' && user.rideIds) {
      return items.filter(item => item.rideId && user.rideIds!.includes(item.rideId));
    }
  }

  return items;
}

export function filterByZone<T>(
  user: User | null | undefined,
  items: T[],
  _getId: (item: T) => string,
  getZoneId: (item: T) => string | undefined
): T[] {
  if (!user) return items;
  if (user.role === 'gm' || user.role === 'director' || user.role === 'maintenance') {
    return items;
  }
  if (user.role === 'zone_manager' && user.zoneIds) {
    return items.filter((item) => {
      const zid = getZoneId(item);
      return zid ? user.zoneIds!.includes(zid) : true;
    });
  }
  if (user.role === 'supervisor' && user.zoneIds) {
    return items.filter((item) => {
      const zid = getZoneId(item);
      return zid ? user.zoneIds!.includes(zid) : true;
    });
  }
  return items;
}
