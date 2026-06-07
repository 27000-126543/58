import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  Calendar,
  Clock,
  LogOut,
  UserCog,
  User,
  AlertTriangle,
  X,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/appStore';
import type { User as UserType } from '@shared/types';
import { cn } from '@/lib/utils';

const breadcrumbMap: Record<string, { label: string; parent?: string }> = {
  '/dashboard': { label: '核心看板' },
  '/alerts': { label: '预警管理' },
  '/forecast': { label: '客流预测' },
  '/reports': { label: '运营报告' },
};

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userList, setUserList] = useState<UserType[]>([]);
  const { user, selectedDate, setSelectedDate, alerts, login, logout, fetchUsers } = useAppStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchUsers().then(setUserList);
  }, [fetchUsers]);

  const pathname = location.pathname;
  const activeAlerts = alerts.filter((a) => a.status === 'active' || a.status === 'processing' || a.status === 'escalated');

  const getBreadcrumbs = () => {
    const items: { label: string; path?: string }[] = [{ label: '首页', path: '/dashboard' }];

    if (pathname.startsWith('/project/')) {
      const projectId = pathname.split('/')[2];
      items.push({ label: '项目详情' });
      items.push({ label: `项目 ${projectId}` });
    } else if (breadcrumbMap[pathname]) {
      items.push({ label: breadcrumbMap[pathname].label });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSwitchRole = async (userId: string) => {
    await login(userId);
    setShowUserMenu(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const renderDatePicker = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = dayjs().subtract(i, 'day');
      dates.push({
        date: d.format('YYYY-MM-DD'),
        label: i === 0 ? '今天' : i === 1 ? '昨天' : d.format('MM-DD'),
        weekday: d.format('ddd'),
      });
    }

    return (
      <div className="absolute right-0 top-full mt-2 w-64 bg-navy-800/95 backdrop-blur-xl rounded-xl border border-navy-600/50 shadow-xl overflow-hidden z-50">
        <div className="px-4 py-3 border-b border-navy-600/40 flex items-center justify-between">
          <span className="text-white text-sm font-medium">选择日期</span>
          <button onClick={() => setShowDatePicker(false)} className="text-metal-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-2">
          {dates.map((d) => (
            <button
              key={d.date}
              onClick={() => handleDateSelect(d.date)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors',
                selectedDate === d.date
                  ? 'bg-accent-teal/20 text-accent-teal'
                  : 'text-metal-300 hover:bg-navy-700/60 hover:text-white'
              )}
            >
              <span className="font-medium">{d.label}</span>
              <span className="text-xs text-metal-400">{d.weekday}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="absolute right-0 top-full mt-2 w-80 bg-navy-800/95 backdrop-blur-xl rounded-xl border border-navy-600/50 shadow-xl overflow-hidden z-50">
      <div className="px-4 py-3 border-b border-navy-600/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent-orange" />
          <span className="text-white text-sm font-medium">预警通知</span>
          <span className="px-1.5 py-0.5 bg-accent-red text-white text-xs rounded-full">{activeAlerts.length}</span>
        </div>
        <button onClick={() => setShowNotifications(false)} className="text-metal-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {activeAlerts.length === 0 ? (
          <div className="px-4 py-8 text-center text-metal-400 text-sm">暂无预警通知</div>
        ) : (
          <div className="divide-y divide-navy-600/40">
            {activeAlerts.slice(0, 5).map((alert) => (
              <Link
                key={alert.id}
                to="/alerts"
                onClick={() => setShowNotifications(false)}
                className="block px-4 py-3 hover:bg-navy-700/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                      alert.level === 2 ? 'bg-accent-red/20' : 'bg-accent-orange/20'
                    )}
                  >
                    <AlertTriangle
                      className={cn('w-4 h-4', alert.level === 2 ? 'text-accent-red' : 'text-accent-orange')}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-medium truncate">{alert.rideName}</span>
                      <span
                        className={cn(
                          'px-1.5 py-0.5 text-xs rounded',
                          alert.level === 2 ? 'bg-accent-red/20 text-accent-red' : 'bg-accent-orange/20 text-accent-orange'
                        )}
                      >
                        {alert.level === 2 ? '紧急' : '警告'}
                      </span>
                    </div>
                    <p className="text-metal-400 text-xs line-clamp-2">{alert.message}</p>
                    <p className="text-metal-500 text-xs mt-1">{dayjs(alert.createdAt).fromNow()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      {activeAlerts.length > 0 && (
        <Link
          to="/alerts"
          onClick={() => setShowNotifications(false)}
          className="block px-4 py-3 border-t border-navy-600/40 text-center text-accent-teal text-sm hover:bg-navy-700/40 transition-colors"
        >
          查看全部预警
        </Link>
      )}
    </div>
  );

  const renderUserMenu = () => (
    <div className="absolute right-0 top-full mt-2 w-56 bg-navy-800/95 backdrop-blur-xl rounded-xl border border-navy-600/50 shadow-xl overflow-hidden z-50">
      <div className="px-4 py-3 border-b border-navy-600/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-orange to-accent-gold flex items-center justify-center text-xl">
            {user?.avatar || '👤'}
          </div>
          <div>
            <div className="text-white text-sm font-medium">{user?.name}</div>
            <div className="text-metal-400 text-xs">{user?.roleName}</div>
          </div>
        </div>
      </div>
      <div className="py-1">
        <div className="px-4 py-2">
          <p className="text-xs text-metal-400 mb-2 flex items-center gap-1">
            <UserCog className="w-3 h-3" />
            切换角色
          </p>
          <div className="space-y-0.5">
            {userList.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSwitchRole(u.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                  user?.id === u.id
                    ? 'bg-accent-teal/20 text-accent-teal'
                    : 'text-metal-300 hover:bg-navy-700/60 hover:text-white'
                )}
              >
                <span>{u.avatar}</span>
                <span>{u.roleName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-navy-600/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-metal-300 hover:text-accent-red hover:bg-navy-700/40 text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>退出登录</span>
        </button>
      </div>
    </div>
  );

  return (
    <header className="h-16 bg-navy-800/80 backdrop-blur-xl border-b border-navy-600/50 flex items-center justify-between px-6 relative z-10">
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/50 via-transparent to-navy-900/50 pointer-events-none" />

      <div className="relative z-10 flex items-center gap-2">
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-metal-500" />}
            {item.path && index < breadcrumbs.length - 1 ? (
              <Link to={item.path} className="text-metal-400 hover:text-accent-teal text-sm transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={cn(index === breadcrumbs.length - 1 ? 'text-white font-medium' : 'text-metal-400', 'text-sm')}>
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-700/50 border border-navy-600/40">
          <Clock className="w-4 h-4 text-accent-teal" />
          <span className="text-white text-sm font-mono tabular-nums">{currentTime.format('HH:mm:ss')}</span>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-700/50 border border-navy-600/40 hover:border-accent-teal/50 transition-colors"
          >
            <Calendar className="w-4 h-4 text-accent-teal" />
            <span className="text-white text-sm">
              {dayjs(selectedDate).format('YYYY-MM-DD')}
              {dayjs(selectedDate).isSame(dayjs(), 'day') && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-accent-teal/20 text-accent-teal text-xs rounded">今天</span>
              )}
            </span>
          </button>
          {showDatePicker && renderDatePicker()}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowDatePicker(false);
              setShowUserMenu(false);
            }}
            className="relative w-10 h-10 rounded-lg bg-navy-700/50 border border-navy-600/40 flex items-center justify-center hover:border-accent-orange/50 transition-colors"
          >
            <Bell className="w-5 h-5 text-metal-300" />
            {activeAlerts.length > 0 && (
              <>
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-red rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                  {activeAlerts.length}
                </span>
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-red rounded-full animate-ping opacity-75" />
              </>
            )}
          </button>
          {showNotifications && renderNotifications()}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowDatePicker(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-navy-700/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-orange to-accent-gold flex items-center justify-center text-lg shadow-glow-orange/30">
              {user?.avatar || <User className="w-5 h-5 text-white" />}
            </div>
          </button>
          {showUserMenu && renderUserMenu()}
        </div>
      </div>
    </header>
  );
}
