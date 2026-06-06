import { useState, useEffect } from 'react';
import { X, Check, XCircle, Clock, User, Send, ArrowUpRight, MessageSquare } from 'lucide-react';
import dayjs from 'dayjs';
import type { Alert, UserRole } from '@/types';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

interface ApprovalFlowModalProps {
  alert: Alert;
  onClose: () => void;
}

const stepRoleMap: Record<number, UserRole> = {
  0: 'zone_manager',
  1: 'director',
  2: 'gm',
};

const statusConfig = {
  pending: {
    label: '待处理',
    class: 'bg-amber-100 text-amber-700',
    dotClass: 'bg-amber-400',
    icon: Clock,
  },
  approved: {
    label: '已批准',
    class: 'bg-green-100 text-green-700',
    dotClass: 'bg-green-500',
    icon: Check,
  },
  rejected: {
    label: '已拒绝',
    class: 'bg-red-100 text-red-700',
    dotClass: 'bg-red-500',
    icon: XCircle,
  },
};

export default function ApprovalFlowModal({ alert, onClose }: ApprovalFlowModalProps) {
  const { currentUser, approveStep, rejectStep } = useAppStore();
  const [comment, setComment] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const flow = alert.approvalFlow;
  if (!flow) return null;

  const canApproveCurrentStep = (stepIndex: number): boolean => {
    if (!currentUser || !flow) return false;
    if (flow.currentStep !== stepIndex) return false;
    const requiredRole = stepRoleMap[stepIndex];
    if (!requiredRole) return false;
    const step = flow.steps[stepIndex];
    if (step.status !== 'pending') return false;
    if (currentUser.role === 'gm') return true;
    if (currentUser.role === 'director' && stepIndex <= 1) return true;
    if (currentUser.role === 'zone_manager' && stepIndex === 0) {
      if (currentUser.zoneIds && currentUser.zoneIds.includes(alert.zoneId)) {
        return true;
      }
    }
    return currentUser.role === requiredRole;
  };

  const handleApprove = (stepIndex: number) => {
    if (!currentUser) return;
    approveStep(alert.id, stepIndex, currentUser.id, currentUser.name, comment.trim() || undefined);
    setComment('');
  };

  const handleReject = (stepIndex: number) => {
    if (!currentUser) return;
    rejectStep(alert.id, stepIndex, currentUser.id, currentUser.name, comment.trim() || undefined);
    setComment('');
  };

  const approvedCount = flow.steps.filter(s => s.status === 'approved').length;
  const progressPercent = (approvedCount / flow.steps.length) * 100;

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
          'relative w-full max-w-lg max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out',
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <ArrowUpRight className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">审批流程</h2>
              <p className="text-xs text-gray-500">{flow.actionTypeName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-200px)]">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {alert.rideName} · {alert.type === 'queue' ? '排队预警' : '振动预警'}
              </h3>
              <p className="text-xs text-gray-600">{alert.message}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{alert.zoneName}</span>
              <span>申请时间：{dayjs(alert.escalatedAt).format('MM-DD HH:mm')}</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-purple-700 font-medium">审批进度</span>
                <span className="text-purple-600">{approvedCount}/{flow.steps.length} 已完成</span>
              </div>
              <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="relative">
              {flow.steps.map((step, index) => {
                const status = statusConfig[step.status];
                const StatusIcon = status.icon;
                const isCurrent = flow.currentStep === index && step.status === 'pending';
                const canAct = canApproveCurrentStep(index);

                return (
                  <div key={index} className="relative pb-6 last:pb-0">
                    {index < flow.steps.length - 1 && (
                      <div
                        className={cn(
                          'absolute left-[15px] top-8 w-0.5 h-[calc(100%-24px)]',
                          step.status === 'approved' ? 'bg-green-200' : 'bg-gray-200'
                        )}
                      />
                    )}
                    <div className="flex items-start gap-4">
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full border-4',
                            step.status === 'approved'
                              ? 'bg-green-500 border-green-100 text-white'
                              : step.status === 'rejected'
                              ? 'bg-red-500 border-red-100 text-white'
                              : isCurrent
                              ? 'bg-purple-500 border-purple-100 text-white animate-pulse'
                              : 'bg-gray-200 border-gray-100 text-gray-400'
                          )}
                        >
                          <StatusIcon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              第{index + 1}级 · {step.roleName}
                            </span>
                            <span className={cn('px-2 py-0.5 rounded text-xs font-medium', status.class)}>
                              {status.label}
                            </span>
                          </div>
                          {step.approvedAt && (
                            <span className="text-xs text-gray-400">
                              {dayjs(step.approvedAt).format('MM-DD HH:mm')}
                            </span>
                          )}
                        </div>
                        {step.userName && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                            <User className="h-3 w-3" />
                            <span>审批人：{step.userName}</span>
                          </div>
                        )}
                        {step.comment && (
                          <div className="flex items-start gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg p-2 mb-2">
                            <MessageSquare className="h-3 w-3 mt-0.5 shrink-0 text-gray-400" />
                            <span>{step.comment}</span>
                          </div>
                        )}
                        {canAct && (
                          <div className="mt-3 space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="输入审批意见（选填）"
                                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                                />
                                <Send className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(index)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm"
                              >
                                <Check className="h-3.5 w-3.5" />
                                批准
                              </button>
                              <button
                                onClick={() => handleReject(index)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                拒绝
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleClose}
            className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
