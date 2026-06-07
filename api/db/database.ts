import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  Zone,
  Ride,
  QueueRecord,
  GateRecord,
  RestaurantData,
  RestaurantOrder,
  VibrationReading,
  StaffShift,
  Alert,
  ApprovalFlow,
  ApprovalStep,
  ForecastData,
  StrategyRecommendation,
  WeeklyReport,
  User,
  ZoneVisitor,
} from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  zones: Zone[];
  rides: Ride[];
  queueRecords: QueueRecord[];
  gateRecords: GateRecord[];
  restaurants: RestaurantData[];
  restaurantOrders: RestaurantOrder[];
  vibrationReadings: VibrationReading[];
  staffShifts: StaffShift[];
  alerts: Alert[];
  approvalFlows: ApprovalFlow[];
  approvalSteps: ApprovalStep[];
  forecastData: ForecastData[];
  strategies: StrategyRecommendation[];
  weeklyReports: WeeklyReport[];
  users: User[];
  zoneVisitors: ZoneVisitor[];
}

export function createEmptyDatabase(): DatabaseSchema {
  return {
    zones: [],
    rides: [],
    queueRecords: [],
    gateRecords: [],
    restaurants: [],
    restaurantOrders: [],
    vibrationReadings: [],
    staffShifts: [],
    alerts: [],
    approvalFlows: [],
    approvalSteps: [],
    forecastData: [],
    strategies: [],
    weeklyReports: [],
    users: [],
    zoneVisitors: [],
  };
}

export let db: DatabaseSchema = createEmptyDatabase();

export function isDatabaseEmpty(data: DatabaseSchema): boolean {
  return (
    data.zones.length === 0 &&
    data.rides.length === 0 &&
    data.users.length === 0
  );
}

export function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      db = createEmptyDatabase();
      return db;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;

    db = {
      ...createEmptyDatabase(),
      ...parsed,
    };

    return db;
  } catch (err) {
    console.error('[DB] 加载数据库失败，使用空数据库:', err);
    db = createEmptyDatabase();
    return db;
  }
}

export function saveDatabase(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const tmpFile = DB_FILE + '.tmp';
    const data = JSON.stringify(db, null, 2);

    fs.writeFileSync(tmpFile, data, 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('[DB] 保存数据库失败:', err);
  }
}

export function resetDatabase(): DatabaseSchema {
  db = createEmptyDatabase();
  try {
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
    const tmpFile = DB_FILE + '.tmp';
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  } catch (err) {
    console.error('[DB] 重置数据库失败:', err);
  }
  return db;
}

let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutoSave(): void {
  if (autoSaveTimer) return;

  autoSaveTimer = setInterval(() => {
    saveDatabase();
  }, 30 * 1000);

  const handleExit = () => {
    saveDatabase();
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
      autoSaveTimer = null;
    }
    process.exit(0);
  };

  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
}

export function stopAutoSave(): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}
