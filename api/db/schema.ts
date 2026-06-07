import { getDb } from './index.js';

const TABLES = [
  `CREATE TABLE IF NOT EXISTS zones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    visitor_count INTEGER NOT NULL DEFAULT 0,
    capacity INTEGER NOT NULL,
    heat_level REAL NOT NULL DEFAULT 0,
    color TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS rides (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    zone_id TEXT NOT NULL,
    zone_name TEXT NOT NULL,
    current_wait_time INTEGER NOT NULL DEFAULT 0,
    avg_wait_time INTEGER NOT NULL DEFAULT 0,
    capacity INTEGER NOT NULL,
    availability REAL NOT NULL DEFAULT 100,
    satisfaction REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'normal',
    vibration_level REAL NOT NULL DEFAULT 0,
    vibration_threshold REAL NOT NULL DEFAULT 5,
    today_rides INTEGER NOT NULL DEFAULT 0,
    icon TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS queue_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    wait_time INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_queue_records_ride_timestamp ON queue_records (ride_id, timestamp)`,
  `CREATE TABLE IF NOT EXISTS gate_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    zone_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('in', 'out')),
    count INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_gate_records_zone_timestamp ON gate_records (zone_id, timestamp)`,
  `CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    zone_id TEXT NOT NULL,
    turnover_rate REAL NOT NULL DEFAULT 0,
    today_sales INTEGER NOT NULL DEFAULT 0,
    avg_wait_time INTEGER NOT NULL DEFAULT 0,
    capacity INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS restaurant_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    amount REAL NOT NULL,
    guest_count INTEGER NOT NULL,
    table_number INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS vibration_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    x_axis REAL NOT NULL,
    y_axis REAL NOT NULL,
    z_axis REAL NOT NULL,
    overall_level REAL NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_vibration_readings_ride_timestamp ON vibration_readings (ride_id, timestamp)`,
  `CREATE TABLE IF NOT EXISTS staff_shifts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    zone_id TEXT NOT NULL,
    shift TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('queue', 'vibration')),
    level INTEGER NOT NULL CHECK(level IN (1, 2)),
    ride_id TEXT NOT NULL,
    ride_name TEXT NOT NULL,
    zone_id TEXT NOT NULL,
    zone_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL,
    escalated_at TEXT,
    resolved_at TEXT,
    status TEXT NOT NULL,
    handled_by TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS approval_flows (
    id TEXT PRIMARY KEY,
    alert_id TEXT NOT NULL,
    current_step INTEGER NOT NULL DEFAULT 0,
    action_type TEXT NOT NULL,
    action_type_name TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS approval_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flow_id TEXT NOT NULL,
    role TEXT NOT NULL,
    role_name TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    status TEXT NOT NULL,
    comment TEXT,
    approved_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS forecast_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    predicted_visitors INTEGER NOT NULL,
    lower_bound INTEGER NOT NULL,
    upper_bound INTEGER NOT NULL,
    historical_visitors INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS strategies (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    expected_impact TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    priority TEXT NOT NULL,
    adopted INTEGER NOT NULL DEFAULT 0,
    created_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS weekly_reports (
    id TEXT PRIMARY KEY,
    week_start TEXT NOT NULL,
    week_end TEXT NOT NULL,
    metrics_json TEXT NOT NULL,
    recommendations_json TEXT NOT NULL,
    generated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    role_name TEXT NOT NULL,
    zone_ids_json TEXT,
    ride_ids_json TEXT,
    avatar TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS zone_visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    visitor_count INTEGER NOT NULL
  )`,
];

export function initSchema(): void {
  const db = getDb();
  const transaction = db.transaction(() => {
    for (const sql of TABLES) {
      db.exec(sql);
    }
  });
  transaction();
}

export default initSchema;
