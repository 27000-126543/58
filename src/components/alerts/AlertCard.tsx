import { useState, useEffect } from 'react';
import { Users, Activity, Clock, ShieldCheck, TrendingUp, XCircle, CheckCircle, ArrowUpRight } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import type { Alert, UserRole, ApprovalFlow, ApprovalStep } from '@shared/types';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

type ExtendedAlert = Alert & {
  approvalFlow?: ApprovalFlow & { steps: ApprovalStep[] };
};

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

interface AlertCardProps {
  alert: ExtendedAlert;
  onHandle?: () => void;
  onEscalate?: () => void;
  onViewApproval?: () => void;
}

const levelConfig = {
  1: {
    barClass: 'bg-gradient-to-b from-orange-400 to-orange-600',
    glowClass: 'shadow-orange-400/40',
    pulseClass: 'bg-orange-500',
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
    label: '一级预警',
  },
  2: {
    barClass: 'bg-gradient-to-b from-red-400 to-red-600',
    glowClass: 'shadow-red-400/40',
    pulseClass: 'bg-red-500',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    label: '二级预警',
  },
};

const statusConfig = {
  active: { label: '待处理', class: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  processing: { label: '处理中', class: 'bg-blue-100 text-blue-700 border-blue-200', icon: ShieldCheck },
  escalated: { label: '已升级', class: 'bg-purple-100 text-purple-700 border-purple-200', icon: TrendingUp },
  resolved: { label: '已解除', class: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
};

const rolePermissions: Record<UserRole, string[]> = {
  gm: ['handle', 'resolve', 'escalate'],
  director: ['handle', 'resolve', 'escalate'],
  zone_manager: ['handle', 'resolve', 'escalate'],
  supervisor: ['handle', 'resolve'],
  maintenance: ['handle', 'resolve'],
};

export default function AlertCard({ alert, onHandle, onEscalate, onViewApproval }: AlertCardProps) {
  const { user, handleAlert, resolveAlert } = useAppStore();
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const level = levelConfig[alert.level];
  const status = statusConfig[alert.status];
  const StatusIcon = status.icon;
  const duration = now.diff(dayjs(alert.createdAt), 'minute');
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  const durationText = hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;

  const permissions = user ? rolePermissions[user.role] || [] : [];
  const canHandle = permissions.includes('handle') && alert.status === 'active';
  const canResolve = permissions.includes('resolve') && (alert.status === 'processing' || alert.status === 'escalated');
  const canEscalate = permissions.includes('escalate') && (alert.status === 'active' || alert.status === 'processing') && !alert.approvalFlow;

  const approvalProgress = alert.approvalFlow
    ? alert.approvalFlow.steps.filter(s => s.status === 'approved').length / alert.approvalFlow.steps.length * 100
    : 0;

  const handleHandle = () => {
    if (user) {
      handleAlert(alert.id, user.name);
    }
    onHandle?.();
  };

  const handleResolve = () => {
    resolveAlert(alert.id);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl',
        alert.status !== 'resolved' && 'animate-pulse-slow'
      )}
    >
      <div className={cn('absolute left-0 top-0 bottom-0 w-1.5', level.barClass)} />
      <div className={cn('absolute left-0 top-0 bottom-0 w-1.5 opacity-50 blur-sm', level.glowClass)} />
      <div className="pl-5 pr-5 py-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'relative flex h-10 w-10 items-center justify-center rounded-lg',
              alert.level === 1 ? 'bg-orange-50' : 'bg-red-50'
            )}>
              <span className="absolute inset-0 rounded-lg opacity-30 animate-ping" style={{ background: alert.level === 1 ? '#f97316' : '#ef4444' }} />
              {alert.type === 'queue' ? (
                <Users className={cn('h-5 w-5 relative z-10', alert.level === 1 ? 'text-orange-600' : 'text-red-600')} />
              ) : (
                <Activity className={cn('h-5 w-5 relative z-10', alert.level === 1 ? 'text-orange-600' : 'text-red-600')} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {alert.rideName}
                  <span className="text-gray-400 mx-1">·</span>
                  {alert.type === 'queue' ? '排队预警' : '振动预警'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border', level.badgeClass)}>
                  {level.label}
                </span>
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border', status.class)}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{alert.message}</p>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{dayjs(alert.createdAt).format('MM-DD HH:mm')}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>已持续 {durationText}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{alert.zoneName}</span>
          </div>
        </div>

        {alert.handledBy && (
          <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
            <span>处理人：{alert.handledBy}</span>
          </div>
        )}

        {alert.approvalFlow && (
          <div className="mb-4 rounded-lg bg-purple-50 p-3 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-3.5 w-3.5 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">
                  审批中 · {alert.approvalFlow.actionTypeName}
                </span>
              </div>
              <button
                onClick={onViewApproval}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
              >
                查看详情
              </button>
            </div>
            <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${approvalProgress}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-purple-600">
              <span>{alert.approvalFlow.steps.filter(s => s.status === 'approved').length}/{alert.approvalFlow.steps.length} 已批准</span>
              <span>{Math.round(approvalProgress)}%</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {canHandle && (
            <button
              onClick={handleHandle}
              className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
            >
              处理预警
            </button>
          )}
          {canEscalate && (
            <button
              onClick={onEscalate}
              className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors border border-orange-100"
            >
              升级预警
            </button>
          )}
          {canResolve && (
            <button
              onClick={handleResolve}
              className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-100"
            >
              解除预警
            </button>
          )}
          {alert.status === 'resolved' && (
            <div className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-gray-400">
              <XCircle className="h-3.5 w-3.5" />
              <span>预警已解除</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
