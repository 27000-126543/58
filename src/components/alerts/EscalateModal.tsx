import { useState, useEffect } from 'react';
import { X, ArrowUpRight, Users, Zap, AlertTriangle, CheckCircle2, Shield, FileText } from 'lucide-react';
import dayjs from 'dayjs';
import type { Alert, ActionType } from '@/types';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

interface EscalateModalProps {
  alert: Alert;
  onClose: () => void;
  onSuccess?: () => void;
}

const actionOptions: { value: ActionType; label: string; description: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  {
    value: 'restrict_flow',
    label: '临时限流',
    description: '限制进入排队区域的游客数量，降低排队压力',
    icon: Users,
    color: 'amber',
  },
  {
    value: 'fast_pass',
    label: '加开快速通道',
    description: '增加快速通道名额，分流高端游客，缩短整体等待时间',
    icon: Zap,
    color: 'blue',
  },
];

const colorClasses = {
  amber: {
    active: 'border-amber-400 bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    dot: 'bg-amber-500',
  },
  blue: {
    active: 'border-blue-400 bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    dot: 'bg-blue-500',
  },
};

export default function EscalateModal({ alert, onClose, onSuccess }: EscalateModalProps) {
  const { escalateAlert } = useAppStore();
  const [actionType, setActionType] = useState<ActionType>('restrict_flow');
  const [reason, setReason] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    escalateAlert(alert.id, actionType);
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      onSuccess?.();
      handleClose();
    }, 1200);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div
        className={cn(
          'relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out',
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        )}
      >
        {success ? (
          <div className="px-6 py-12 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-green-200 animate-ping opacity-40" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">升级申请已提交</h3>
            <p className="text-sm text-gray-500">审批流程已启动，请等待各级审批</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                    <ArrowUpRight className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">升级预警</h2>
                    <p className="text-xs text-gray-500">将启动三级审批流程</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/60 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-0.5">
                    {alert.rideName} · {alert.type === 'queue' ? '排队预警' : '振动预警'}
                  </div>
                  <div className="text-xs text-gray-600 mb-1.5">{alert.message}</div>
                  <div className="text-xs text-gray-400">
                    开始时间：{dayjs(alert.createdAt).format('MM-DD HH:mm')}
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2.5">
                  <Shield className="h-4 w-4 text-gray-500" />
                  选择操作类型
                </label>
                <div className="space-y-2">
                  {actionOptions.map(opt => {
                    const Icon = opt.icon;
                    const colors = colorClasses[opt.color as keyof typeof colorClasses];
                    const isActive = actionType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setActionType(opt.value)}
                        className={cn(
                          'w-full flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left',
                          isActive
                            ? colors.active
                            : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', colors.icon)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn('h-2 w-2 rounded-full', colors.dot)} />
                            <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">{opt.description}</p>
                        </div>
                        <div
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 mt-0.5 transition-all',
                            isActive ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                          )}
                        >
                          {isActive && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2.5">
                  <FileText className="h-4 w-4 text-gray-500" />
                  申请理由
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="请详细描述升级预警的原因和期望解决的问题..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 focus:bg-white transition-all resize-none"
                />
                <div className="mt-1.5 flex justify-between text-xs text-gray-400">
                  <span>请填写充分的理由以便审批人判断</span>
                  <span>{reason.length}/500</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 border border-purple-100">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <span className="text-xs font-bold text-purple-600">!</span>
                </div>
                <div className="text-xs text-purple-700 leading-relaxed">
                  提交后将自动启动三级审批流程：<strong>区域经理复核</strong> → <strong>运营总监批准</strong> → <strong>园区总经理备案</strong>，审批通过后操作自动生效。
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-700 bg-white rounded-xl hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason.trim() || submitting}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-medium text-white rounded-xl transition-all shadow-sm',
                  !reason.trim() || submitting
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:scale-[0.98]'
                )}
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4" />
                    确认升级
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
