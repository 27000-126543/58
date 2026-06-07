import {
  db as rawDb,
  loadDatabase,
  saveDatabase,
  resetDatabase,
  isDatabaseEmpty,
  startAutoSave,
  stopAutoSave,
  createEmptyDatabase,
  type DatabaseSchema,
} from './database.js';
import { seed } from './seed.js';

export { loadDatabase, saveDatabase, resetDatabase, seed, createEmptyDatabase, startAutoSave, stopAutoSave };
export type { DatabaseSchema };

type DbRecord = Record<string, any>;

const TABLE_MAP: Record<string, keyof DatabaseSchema> = {
  zones: 'zones',
  rides: 'rides',
  queue_records: 'queueRecords',
  gate_records: 'gateRecords',
  restaurants: 'restaurants',
  restaurant_orders: 'restaurantOrders',
  vibration_readings: 'vibrationReadings',
  staff_shifts: 'staffShifts',
  alerts: 'alerts',
  approval_flows: 'approvalFlows',
  approval_steps: 'approvalSteps',
  forecast_data: 'forecastData',
  strategies: 'strategies',
  weekly_reports: 'weeklyReports',
  users: 'users',
  zone_visitors: 'zoneVisitors',
};

const SNAKE_TO_CAMEL: Record<string, Record<string, string>> = {
  zones: { visitor_count: 'visitorCount', heat_level: 'heatLevel' },
  rides: {
    zone_id: 'zoneId', zone_name: 'zoneName', current_wait_time: 'currentWaitTime',
    avg_wait_time: 'avgWaitTime', vibration_level: 'vibrationLevel',
    vibration_threshold: 'vibrationThreshold', today_rides: 'todayRides',
  },
  queue_records: { ride_id: 'rideId', wait_time: 'waitTime' },
  gate_records: { zone_id: 'zoneId' },
  restaurants: { zone_id: 'zoneId', turnover_rate: 'turnoverRate', today_sales: 'todaySales', avg_wait_time: 'avgWaitTime' },
  restaurant_orders: { restaurant_id: 'restaurantId', guest_count: 'guestCount', table_number: 'tableNumber' },
  vibration_readings: { ride_id: 'rideId', x_axis: 'xAxis', y_axis: 'yAxis', z_axis: 'zAxis', overall_level: 'overallLevel' },
  staff_shifts: { zone_id: 'zoneId', start_time: 'startTime', end_time: 'endTime' },
  alerts: {
    ride_id: 'rideId', ride_name: 'rideName', zone_id: 'zoneId', zone_name: 'zoneName',
    created_at: 'createdAt', escalated_at: 'escalatedAt', resolved_at: 'resolvedAt', handled_by: 'handledBy',
  },
  approval_flows: { alert_id: 'alertId', current_step: 'currentStep', action_type: 'actionType', action_type_name: 'actionTypeName' },
  approval_steps: { flow_id: 'flowId', role_name: 'roleName', user_id: 'userId', user_name: 'userName', approved_at: 'approvedAt' },
  forecast_data: { predicted_visitors: 'predictedVisitors', lower_bound: 'lowerBound', upper_bound: 'upperBound', historical_visitors: 'historicalVisitors' },
  strategies: { expected_impact: 'expectedImpact', created_at: 'createdAt' },
  weekly_reports: { week_start: 'weekStart', week_end: 'weekEnd', metrics_json: 'metricsJson', recommendations_json: 'recommendationsJson', generated_at: 'generatedAt' },
  users: { role_name: 'roleName', zone_ids_json: 'zoneIdsJson', ride_ids_json: 'rideIdsJson' },
  zone_visitors: { zone_id: 'zoneId', visitor_count: 'visitorCount' },
};

function reverseMap(map: Record<string, string>): Record<string, string> {
  const rev: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) rev[v] = k;
  return rev;
}

const CAMEL_TO_SNAKE: Record<string, Record<string, string>> = {};
for (const [table, map] of Object.entries(SNAKE_TO_CAMEL)) {
  CAMEL_TO_SNAKE[table] = reverseMap(map);
}

function toSnakeCase(table: string, obj: DbRecord): DbRecord {
  const map = CAMEL_TO_SNAKE[table] || {};
  const result: DbRecord = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = map[k] || k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      result[key] = JSON.stringify(v);
    } else if (Array.isArray(v)) {
      result[key] = JSON.stringify(v);
    } else {
      result[key] = v;
    }
  }
  return result;
}

function toCamelCase(table: string, obj: DbRecord): DbRecord {
  const map = SNAKE_TO_CAMEL[table] || {};
  const result: DbRecord = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = map[k] || k;
    if (typeof v === 'string' && (key.endsWith('Json') || k.endsWith('_json'))) {
      try {
        result[key] = JSON.parse(v);
      } catch {
        result[key] = v;
      }
    } else if (key === 'zoneIds' || key === 'rideIds') {
      try {
        result[key] = typeof v === 'string' ? JSON.parse(v) : v;
      } catch {
        result[key] = v;
      }
    } else {
      result[key] = v;
    }
  }
  return result;
}

interface ParsedQuery {
  type: 'select' | 'insert' | 'update' | 'delete' | 'count';
  table: string;
  columns: string[];
  whereClauses: Array<{ column: string; op: string; paramIndex: number }>;
  orderBy?: { column: string; direction: 'ASC' | 'DESC' };
  limit?: number;
  setClauses?: string[];
  insertColumns?: string[];
  join?: { table: string; on: string };
  groupBy?: string;
  aggregations?: Array<{ fn: string; column: string; alias: string }>;
}

function parseSQL(sql: string): ParsedQuery {
  const upper = sql.toUpperCase().trim();
  const result: ParsedQuery = {
    type: 'select',
    table: '',
    columns: [],
    whereClauses: [],
  };

  if (upper.startsWith('SELECT')) {
    result.type = upper.includes('COUNT(') ? 'count' : 'select';

    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    if (fromMatch) result.table = fromMatch[1];

    const whereMatch = sql.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|GROUP|$)/is);
    if (whereMatch) {
      const whereStr = whereMatch[1];
      const clauses = whereStr.split(/\s+AND\s+/i);
      let paramIdx = 0;
      for (const clause of clauses) {
        const match = clause.trim().match(/(\w+)\s*(>=|<=|<>|!=|=|>|<|IN|LIKE)\s*(\?|.+)/i);
        if (match) {
          result.whereClauses.push({
            column: match[1],
            op: match[2].toUpperCase(),
            paramIndex: paramIdx++,
          });
        }
      }
    }

    const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
      result.orderBy = {
        column: orderMatch[1],
        direction: (orderMatch[2] || 'ASC').toUpperCase() as 'ASC' | 'DESC',
      };
    }

    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) result.limit = parseInt(limitMatch[1]);

    const groupMatch = sql.match(/GROUP\s+BY\s+(\w+)/i);
    if (groupMatch) result.groupBy = groupMatch[1];

    if (upper.includes('JOIN')) {
      const joinMatch = sql.match(/JOIN\s+(\w+)\s+ON\s+(.+?)(?:\s+WHERE|\s+ORDER|\s+GROUP|\s+LIMIT|$)/is);
      if (joinMatch) {
        result.join = { table: joinMatch[1], on: joinMatch[2].trim() };
      }
    }

    const aggMatches = [...sql.matchAll(/(SUM|AVG|COUNT|COALESCE|MIN|MAX)\s*\(\s*(?:DISTINCT\s+)?(.+?)\s*\)(?:\s+AS\s+(\w+))?/gi)];
    if (aggMatches.length > 0) {
      result.aggregations = [];
      for (const m of aggMatches) {
        result.aggregations.push({
          fn: m[1].toUpperCase(),
          column: m[2].trim(),
          alias: m[3] || m[0],
        });
      }
    }
  } else if (upper.startsWith('INSERT')) {
    result.type = 'insert';
    const tableMatch = sql.match(/INTO\s+(\w+)/i);
    if (tableMatch) result.table = tableMatch[1];
    const colsMatch = sql.match(/\((.+?)\)/);
    if (colsMatch) {
      result.insertColumns = colsMatch[1].split(',').map(c => c.trim());
    }
  } else if (upper.startsWith('UPDATE')) {
    result.type = 'update';
    const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
    if (tableMatch) result.table = tableMatch[1];
    const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/is);
    if (setMatch) {
      result.setClauses = setMatch[1].split(',').map(s => s.trim().split('=')[0].trim());
    }
    const whereMatch = sql.match(/WHERE\s+(.+)$/is);
    if (whereMatch) {
      let paramIdx = 0;
      const clauses = whereMatch[1].split(/\s+AND\s+/i);
      for (const clause of clauses) {
        const match = clause.trim().match(/(\w+)\s*(>=|<=|<>|!=|=|>|<)\s*\?/i);
        if (match) {
          result.whereClauses.push({
            column: match[1],
            op: match[2].toUpperCase(),
            paramIndex: paramIdx++,
          });
        }
      }
    }
  } else if (upper.startsWith('DELETE')) {
    result.type = 'delete';
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    if (tableMatch) result.table = tableMatch[1];
  } else if (upper.startsWith('INSERT OR REPLACE')) {
    result.type = 'insert';
    const tableMatch = sql.match(/INTO\s+(\w+)/i);
    if (tableMatch) result.table = tableMatch[1];
    const colsMatch = sql.match(/\((.+?)\)/);
    if (colsMatch) {
      result.insertColumns = colsMatch[1].split(',').map(c => c.trim());
    }
  }

  return result;
}

function getTableData(table: string): DbRecord[] {
  const key = TABLE_MAP[table];
  if (!key) return [];
  return (rawDb as any)[key] || [];
}

function setTableData(table: string, data: DbRecord[]): void {
  const key = TABLE_MAP[table];
  if (key) (rawDb as any)[key] = data;
}

function evalCondition(rowVal: any, op: string, paramVal: any): boolean {
  switch (op) {
    case '=':
    case '==':
      return rowVal == paramVal;
    case '!=':
    case '<>':
      return rowVal != paramVal;
    case '>':
      return rowVal > paramVal;
    case '<':
      return rowVal < paramVal;
    case '>=':
      return rowVal >= paramVal;
    case '<=':
      return rowVal <= paramVal;
    case 'IN':
      return Array.isArray(paramVal) && paramVal.includes(rowVal);
    case 'LIKE':
      if (typeof rowVal !== 'string' || typeof paramVal !== 'string') return false;
      const pattern = paramVal.replace(/%/g, '.*').replace(/_/g, '.');
      return new RegExp('^' + pattern + '$', 'i').test(rowVal);
    default:
      return true;
  }
}

class Statement {
  private parsed: ParsedQuery;

  constructor(sql: string) {
    this.parsed = parseSQL(sql);
  }

  all(...params: any[]): any[] {
    const table = this.parsed.table;
    let data = getTableData(table).map(row => toSnakeCase(table, { ...row }));

    if (this.parsed.join) {
      const joinData = getTableData(this.parsed.join.table).map(row =>
        toSnakeCase(this.parsed.join.table, { ...row })
      );
      const onParts = this.parsed.join.on.split('=').map(s => s.trim().split('.').pop()!);
      const merged: DbRecord[] = [];
      for (const left of data) {
        for (const right of joinData) {
          if (left[onParts[0]] === right[onParts[1]]) {
            merged.push({ ...left, ...right });
          }
        }
      }
      data = merged;
    }

    for (const clause of this.parsed.whereClauses) {
      const param = params[clause.paramIndex];
      data = data.filter(row => evalCondition(row[clause.column], clause.op, param));
    }

    if (this.parsed.groupBy) {
      const groups: Record<string, DbRecord[]> = {};
      for (const row of data) {
        const key = String(row[this.parsed.groupBy]);
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      }
      const aggregated: DbRecord[] = [];
      for (const [key, rows] of Object.entries(groups)) {
        const aggRow: DbRecord = { [this.parsed.groupBy]: key };
        if (this.parsed.aggregations) {
          for (const agg of this.parsed.aggregations) {
            const values = rows.map(r => {
              if (agg.column === '*') return 1;
              return typeof r[agg.column] === 'number' ? r[agg.column] : 0;
            });
            switch (agg.fn) {
              case 'SUM':
                aggRow[agg.alias] = values.reduce((a, b) => a + b, 0);
                break;
              case 'AVG':
                aggRow[agg.alias] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                break;
              case 'COUNT':
                aggRow[agg.alias] = values.filter(v => v !== null && v !== undefined).length;
                break;
              case 'COALESCE':
                aggRow[agg.alias] = values.find(v => v !== null && v !== undefined) ?? params[0] ?? 0;
                break;
              default:
                aggRow[agg.alias] = values[0];
            }
          }
        }
        aggregated.push(aggRow);
      }
      return aggregated;
    }

    if (this.parsed.aggregations && !this.parsed.groupBy) {
      const aggRow: DbRecord = {};
      for (const agg of this.parsed.aggregations) {
        const values = data.map(r => {
          if (agg.column === '*') return 1;
          return typeof r[agg.column] === 'number' ? r[agg.column] : 0;
        });
        switch (agg.fn) {
          case 'SUM':
            aggRow[agg.alias] = values.reduce((a, b) => a + b, 0);
            break;
          case 'AVG':
            aggRow[agg.alias] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            break;
          case 'COUNT':
            aggRow[agg.alias] = values.filter(v => v !== null && v !== undefined).length;
            break;
          case 'COALESCE':
            aggRow[agg.alias] = values.find(v => v !== null && v !== undefined) ?? 0;
            break;
          case 'MIN':
            aggRow[agg.alias] = values.length > 0 ? Math.min(...values.filter(v => typeof v === 'number')) : 0;
            break;
          case 'MAX':
            aggRow[agg.alias] = values.length > 0 ? Math.max(...values.filter(v => typeof v === 'number')) : 0;
            break;
          default:
            aggRow[agg.alias] = values[0];
        }
      }
      return [aggRow];
    }

    if (this.parsed.orderBy) {
      const { column, direction } = this.parsed.orderBy;
      data.sort((a, b) => {
        const va = a[column];
        const vb = b[column];
        if (va < vb) return direction === 'ASC' ? -1 : 1;
        if (va > vb) return direction === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    if (this.parsed.limit !== undefined) {
      data = data.slice(0, this.parsed.limit);
    }

    return data;
  }

  get(...params: any[]): any {
    const result = this.all(...params);
    return result[0] ?? null;
  }

  run(...params: any[]): { changes: number; lastInsertRowid?: number } {
    const table = this.parsed.table;
    const tableData = getTableData(table);

    if (this.parsed.type === 'insert') {
      const columns = this.parsed.insertColumns || [];
      const obj: DbRecord = {};
      for (let i = 0; i < columns.length; i++) {
        obj[columns[i]] = params[i];
      }
      const camel = toCamelCase(table, obj);
      tableData.push(camel);
      setTableData(table, tableData);
      return { changes: 1, lastInsertRowid: tableData.length };
    }

    if (this.parsed.type === 'update') {
      let changes = 0;
      const setCols = this.parsed.setClauses || [];
      const setValues = params.slice(0, setCols.length);
      const whereParams = params.slice(setCols.length);

      const newTableData = tableData.map(row => {
        const snakeRow = toSnakeCase(table, { ...row });
        let match = true;
        let wpIdx = 0;
        for (const clause of this.parsed.whereClauses) {
          if (!evalCondition(snakeRow[clause.column], clause.op, whereParams[wpIdx++])) {
            match = false;
            break;
          }
        }
        if (!match) return row;
        changes++;
        for (let i = 0; i < setCols.length; i++) {
          snakeRow[setCols[i]] = setValues[i];
        }
        return toCamelCase(table, snakeRow);
      });
      setTableData(table, newTableData);
      return { changes };
    }

    if (this.parsed.type === 'delete') {
      let changes = 0;
      const newTableData = tableData.filter(row => {
        const snakeRow = toSnakeCase(table, { ...row });
        let match = true;
        let wpIdx = 0;
        for (const clause of this.parsed.whereClauses) {
          if (!evalCondition(snakeRow[clause.column], clause.op, params[wpIdx++])) {
            match = false;
            break;
          }
        }
        if (!match) return true;
        changes++;
        return false;
      });
      setTableData(table, newTableData);
      return { changes };
    }

    return { changes: 0 };
  }
}

class DbWrapper {
  prepare(sql: string): Statement {
    return new Statement(sql);
  }

  exec(_sql: string): void {
  }

  pragma(_pragma: string): void {
  }

  transaction<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => {
      return fn(...args);
    }) as T;
  }

  close(): void {
    saveDatabase();
  }
}

const proxy = new Proxy(new DbWrapper(), {
  get(target: any, prop: string | symbol) {
    if (typeof prop === 'string' && prop in rawDb) {
      return (rawDb as any)[prop];
    }
    return target[prop];
  },
}) as any;

export const db = proxy as unknown as {
  prepare: (sql: string) => Statement;
  exec: (sql: string) => void;
  pragma: (pragma: string) => void;
  transaction: <T extends (...args: any[]) => any>(fn: T) => T;
  close: () => void;
  zones: DatabaseSchema['zones'];
  rides: DatabaseSchema['rides'];
  queueRecords: DatabaseSchema['queueRecords'];
  gateRecords: DatabaseSchema['gateRecords'];
  restaurants: DatabaseSchema['restaurants'];
  restaurantOrders: DatabaseSchema['restaurantOrders'];
  vibrationReadings: DatabaseSchema['vibrationReadings'];
  staffShifts: DatabaseSchema['staffShifts'];
  alerts: DatabaseSchema['alerts'];
  approvalFlows: DatabaseSchema['approvalFlows'];
  approvalSteps: DatabaseSchema['approvalSteps'];
  forecastData: DatabaseSchema['forecastData'];
  strategies: DatabaseSchema['strategies'];
  weeklyReports: DatabaseSchema['weeklyReports'];
  users: DatabaseSchema['users'];
  zoneVisitors: DatabaseSchema['zoneVisitors'];
};

export function getDb() {
  return proxy;
}

(function init() {
  loadDatabase();

  if (isDatabaseEmpty(rawDb)) {
    console.log('[DB] 数据库为空，正在初始化种子数据...');
    seed();
  } else {
    console.log('[DB] 数据库加载成功');
  }

  startAutoSave();
})();

export default proxy;
